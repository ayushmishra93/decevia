import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { body, sameOrigin, limit, errorResponse } from '@/lib/security';
import { canManage, isAdmin, csv } from './risk.cjs';
import { idSchema,querySchema,dateWhere,ingestSchema,environmentSchema,assetSchema,settingsSchema,noteSchema,sessionPatch,alertPatch,reportSchema,simulationSchema } from './validation';
import { fail,owned,audit,notify,trafficWhere,ingest,summary,health,simulate } from './data';
import { pdfReport } from './pdf';
const json=data=>Response.json(data,{headers:{'Cache-Control':'no-store'}});
const digest=value=>createHash('sha256').update(value).digest('hex');
const keySelect={id:true,name:true,prefix:true,createdAt:true,lastUsedAt:true,revokedAt:true};
async function page(db,model,where,q,field,include) {const [items,total]=await Promise.all([db[model].findMany({where,skip:(q.page-1)*q.pageSize,take:q.pageSize,orderBy:{[field]:q.order},...(include?{include}:{})}),db[model].count({where})]);return {items,total,page:q.page,pageSize:q.pageSize};}
function download(content,type,name){return new Response(content,{headers:{'Content-Type':type,'Content-Disposition':`attachment; filename="${name}"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function analystAssignment(user,id){if(id&&id!==user.id)fail(403,'Only the owner can be assigned in this personal workspace.');}
async function listOrRead(db,user,parts,q) {
 const [resource,id,action]=parts;const uid=user.id;
 if(resource==='dashboard') {if(id==='system-health')return health(db,uid);const data=await summary(db,uid,q);if(id==='summary')return data.stats;if(id==='charts')return data.charts;if(id==='recent-events')return {events:data.events,sessions:data.sessions,alerts:data.alerts,environments:data.environments};}
 if(resource==='traffic') {
  const where=trafficWhere(uid,q);
  if(id==='stream'){const data=await page(db,'trafficEvent',where,{...q,page:1},'timestamp');return new Response(`retry: 5000\nevent: traffic\ndata: ${JSON.stringify(data)}\n\n`,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Accel-Buffering':'no'}});}
  if(id==='export'){if(await db.trafficEvent.count({where})>10000)fail(422,'Select a narrower range; exports support 10,000 events.');const rows=await db.trafficEvent.findMany({where,take:10000,orderBy:{timestamp:q.order}});return download(csv(rows),'text/csv; charset=utf-8','traffic.csv');}
  if(id){const row=await owned(db,'trafficEvent',id,uid);return {...row,riskDecision:await db.riskDecision.findUnique({where:{trafficEventId:id}})};}
  return page(db,'trafficEvent',where,q,['timestamp','riskScore','sourceIp'].includes(q.sort)?q.sort:'timestamp');
 }
 if(resource==='attack-sessions'){
  if(id){const row=await owned(db,'attackSession',id,uid);const actions=await db.sessionAction.findMany({where:{attackSessionId:id},orderBy:{timestamp:'asc'},take:1000});if(action==='export')return download(csv(actions),'text/csv; charset=utf-8','timeline.csv');if(action==='actions')return {items:actions};return {...row,actions,actionsTruncated:actions.length===1000};}
  return page(db,'attackSession',{ownerId:uid,startedAt:dateWhere(q),riskScore:{gte:q.riskMin,lte:q.riskMax},...(q.status?{status:q.status}:{}),...(q.attackType?{attackType:q.attackType}:{}),...(q.q?{OR:[{sessionCode:{contains:q.q,mode:'insensitive'}},{sourceIp:{contains:q.q}}]}:{})},q,q.sort==='riskScore'?'riskScore':'startedAt');
 }
 if(resource==='ghost-environments'){if(id){const row=await owned(db,'ghostEnvironment',id,uid,'createdById');return {...row,activeSessions:await db.attackSession.findMany({where:{ownerId:uid,ghostEnvironmentId:id,status:'ACTIVE'},take:100})};}return page(db,'ghostEnvironment',{createdById:uid,createdAt:dateWhere(q),...(q.status?{status:q.status}:{}),...(q.q?{name:{contains:q.q,mode:'insensitive'}}:{})},q,'createdAt');}
 if(resource==='alerts'){
  if(id){const row=await owned(db,'alert',id,uid);return {...row,timeline:await db.auditLog.findMany({where:{userId:uid,resourceType:'Alert',resourceId:id},orderBy:{createdAt:'asc'},take:1000})};}
  return page(db,'alert',{ownerId:uid,createdAt:dateWhere(q),...(q.status?{status:q.status}:{}),...(q.severity?{severity:q.severity}:{}),...(q.q?{OR:[{title:{contains:q.q,mode:'insensitive'}},{description:{contains:q.q,mode:'insensitive'}}]}:{})},q,'createdAt');
 }
 if(resource==='threat-intelligence'){
  if(id==='indicators')return page(db,'threatIndicator',{ownerId:uid,lastSeen:dateWhere(q),...(q.q?{value:{contains:q.q,mode:'insensitive'}}:{})},q,'lastSeen');
  const data=await summary(db,uid,q);if(id==='summary')return data.charts;if(id==='trends')return data.charts.traffic;if(id==='locations')return data.charts.locations;if(id==='attack-types')return data.charts.attackTypes;
 }
 if(resource==='reports'){
  if(id){const row=await owned(db,'report',id,uid,'generatedById');if(action==='download'){return q.format==='pdf'?download(pdfReport(row.name,row.snapshot),'application/pdf',`report-${row.id}.pdf`):download(csv(flatten(row.snapshot)),'text/csv; charset=utf-8',`report-${row.id}.csv`);}return row;}
  return page(db,'report',{generatedById:uid,createdAt:dateWhere(q),...(q.q?{name:{contains:q.q,mode:'insensitive'}}:{})},q,'createdAt');
 }
 if(resource==='settings')return await db.userSettings.findUnique({where:{userId:uid}})||{notificationPreferences:{alerts:true,simulation:true},detectionSensitivity:50,monitorThreshold:25,divertThreshold:60,blockThreshold:90,ghostDefaults:{},retentionDays:90,theme:'dark'};
 if(resource==='assets')return id?owned(db,'protectedAsset',id,uid):page(db,'protectedAsset',{ownerId:uid},q,'createdAt');
 if(resource==='api-keys'){if(!isAdmin(user.role))fail(403,'Administrator access required.');return {items:await db.apiKey.findMany({where:{userId:uid},select:keySelect,orderBy:{createdAt:'desc'},take:100})};}
 if(resource==='notifications')return page(db,'notification',{userId:uid},q,'createdAt');
 if(resource==='audit-logs')return page(db,'auditLog',{userId:uid},q,'createdAt');
 if(resource==='simulation')return {enabled:process.env.SIMULATION_MODE==='true',...(await db.simulationState.findUnique({where:{userId:uid}})||{running:false,speed:1})};
 fail(404,'Endpoint not found.');
}
function flatten(value,path='') {return Object.entries(value||{}).flatMap(([key,item])=>item&&typeof item==='object'?flatten(item,path+key+'.'):[{field:path+key,value:item}]);}
async function mutate(db,user,parts,method,input) {
 const [resource,id,action]=parts;const uid=user.id;
 if(resource==='notifications'&&method==='PATCH'&&id){z.object({read:z.boolean()}).strict().parse(input);await owned(db,'notification',id,uid,'userId');return db.notification.update({where:{id},data:{read:input.read}});}
 if(!canManage(user.role))fail(403,'Read-only role.');
 if(['ghost-environments','assets','api-keys','simulation','retention'].includes(resource)&&!isAdmin(user.role))fail(403,'Administrator access required.');
 if(resource==='traffic'&&id==='ingest'&&method==='POST')return ingest(db,uid,ingestSchema.parse(input));
 if(resource==='attack-sessions'&&id){const row=await owned(db,'attackSession',id,uid);
  if(method==='POST'&&action==='notes'){const {note}=noteSchema.parse(input);const result=await db.sessionAction.create({data:{attackSessionId:id,actionType:'ANALYST_NOTE',result:note,severity:'LOW',simulated:row.simulated}});await audit(db,uid,'NOTE','AttackSession',id,{},row.simulated);return result;}
  if(method==='PATCH'&&!action){const data=sessionPatch.parse(input);await analystAssignment(user,data.assignedAnalystId);const result=await db.attackSession.update({where:{id},data:{...data,...(data.status?{endedAt:data.status==='COMPLETED'?new Date():null}:{})}});await audit(db,uid,'UPDATE','AttackSession',id,data,row.simulated);return result;}
 }
 if(resource==='ghost-environments'){
  if(method==='POST'&&!id){const data=environmentSchema.parse(input);const result=await db.ghostEnvironment.create({data:{...data,createdById:uid,simulated:true}});await audit(db,uid,'CREATE','GhostEnvironment',result.id,{},true);return result;}
  if(id){const row=await owned(db,'ghostEnvironment',id,uid,'createdById');let data;
   if(method==='DELETE'&&!action){z.object({confirm:z.literal(true)}).strict().parse(input);if(await db.attackSession.count({where:{ghostEnvironmentId:id}})||await db.alert.count({where:{ghostEnvironmentId:id}}))fail(409,'This environment is referenced by sessions or alerts. Stop it instead.');await db.ghostEnvironment.delete({where:{id}});await audit(db,uid,'DELETE','GhostEnvironment',id,{},row.simulated);return {ok:true};}
   if(method==='PATCH'&&!action)data=environmentSchema.partial().parse(input);
   if(method==='POST'&&['start','stop'].includes(action)){z.object({}).strict().parse(input);if(action==='stop')await db.attackSession.updateMany({where:{ownerId:uid,ghostEnvironmentId:id,status:'ACTIVE',simulated:true},data:{status:'COMPLETED',endedAt:new Date()}});data={status:action==='start'?'RUNNING':'STOPPED',cpuUsage:0,memoryUsage:0};}
   if(data){const result=await db.ghostEnvironment.update({where:{id},data});await audit(db,uid,action||'UPDATE','GhostEnvironment',id,data,row.simulated);return result;}
  }
 }
 if(resource==='alerts'&&id){const row=await owned(db,'alert',id,uid);let data=alertPatch.parse(input);const {note,...changes}=data;data=changes;await analystAssignment(user,data.assignedUserId);
  if(method==='POST'){
   if(action==='assign'){data=z.object({assignedUserId:idSchema.nullable()}).strict().parse(input);await analystAssignment(user,data.assignedUserId);}
   else if(action==='acknowledge'){z.object({}).strict().parse(input);if(row.status==='RESOLVED')fail(409,'Reopen this alert before acknowledging it.');data={status:'INVESTIGATING',acknowledgedAt:new Date()};}
   else if(action==='resolve'){const parsed=z.object({resolutionNotes:z.string().trim().min(1).max(4000)}).strict().parse(input);data={status:'RESOLVED',resolvedAt:new Date(),resolutionNotes:parsed.resolutionNotes};}
   else if(action==='reopen'){z.object({}).strict().parse(input);data={status:'OPEN',resolvedAt:null,acknowledgedAt:null};}else fail(404,'Endpoint not found.');
  }else if(method!=='PATCH'||action)fail(405,'Method not allowed.');
  if(data.status==='RESOLVED'){if(!data.resolutionNotes&&!row.resolutionNotes)fail(400,'Resolution notes are required.');data.resolvedAt=new Date();}
  if(data.status==='OPEN')data.resolvedAt=null;
  if(data.status==='INVESTIGATING'){data.acknowledgedAt=new Date();data.resolvedAt=null;}
  const result=await db.alert.update({where:{id},data});await audit(db,uid,action||'UPDATE','Alert',id,{...data,...(data.resolvedAt?{resolvedAt:data.resolvedAt.toISOString()}:{}),...(data.acknowledgedAt?{acknowledgedAt:data.acknowledgedAt.toISOString()}:{}),...(note?{note}:{})},row.simulated);await notify(db,uid,'Alert updated',`${row.title}: ${result.status}`,'ALERT',row.simulated);return result;
 }
 if(resource==='reports'){
  if(method==='POST'&&!id){const data=reportSchema.parse(input);const q=querySchema.parse({range:'custom',from:data.dateFrom,to:data.dateTo});const scope=data.dataScope==='all'?{}:{simulated:data.dataScope==='simulated'};const all=await summary(db,uid,q,scope);const snapshots={EXECUTIVE:{stats:all.stats,charts:all.charts},ATTACK_BEHAVIOUR:{attackTypes:all.charts.attackTypes,commands:all.charts.commands,risk:all.charts.risk,recentSessions:all.sessions},GHOST_SESSIONS:{stats:all.stats,environments:all.environments,recentSessions:all.sessions},THREAT_INTELLIGENCE:{charts:all.charts,indicators:await db.threatIndicator.findMany({where:{ownerId:uid,lastSeen:dateWhere(q),...scope},take:1000})},SYSTEM_HEALTH:await health(db,uid)};const {dataScope,...fields}=data;const result=await db.report.create({data:{...fields,dateFrom:new Date(data.dateFrom),dateTo:new Date(data.dateTo),generatedById:uid,simulated:dataScope==='simulated',snapshot:JSON.parse(JSON.stringify({range:{from:data.dateFrom,to:data.dateTo},dataScope,generatedAt:new Date(),note:'Health is current at generation; recent record lists are bounded. Charts aggregate the selected range.',...snapshots[data.reportType]}))}});await audit(db,uid,'GENERATE','Report',result.id,{},result.simulated);return db.report.update({where:{id:result.id},data:{fileUrl:'/api/reports/'+result.id+'/download?format=pdf'}});}
  if(method==='DELETE'&&id){z.object({confirm:z.literal(true)}).strict().parse(input);const row=await owned(db,'report',id,uid,'generatedById');await db.report.delete({where:{id}});await audit(db,uid,'DELETE','Report',id,{},row.simulated);return {ok:true};}
 }
 if(resource==='settings'&&method==='PATCH'&&!id){const data=settingsSchema.parse(input);if(!isAdmin(user.role)){const prior=await db.userSettings.findUnique({where:{userId:uid}});const baseline=prior||{detectionSensitivity:50,monitorThreshold:25,divertThreshold:60,blockThreshold:90,retentionDays:90,ghostDefaults:{}};for(const key of ['detectionSensitivity','monitorThreshold','divertThreshold','blockThreshold','retentionDays','ghostDefaults'])if(JSON.stringify(data[key])!==JSON.stringify(baseline[key]))fail(403,'Only administrators may change detection, retention or environment defaults.');}const result=await db.userSettings.upsert({where:{userId:uid},create:{userId:uid,...data},update:data});await audit(db,uid,'UPDATE','Settings',uid);return result;}
 if(resource==='assets'){
  if(method==='POST'&&!id){const result=await db.protectedAsset.create({data:{...assetSchema.parse(input),ownerId:uid}});await audit(db,uid,'CREATE','ProtectedAsset',result.id);return result;}
  if(method==='PATCH'&&id){await owned(db,'protectedAsset',id,uid);const data=assetSchema.partial().parse(input);const result=await db.protectedAsset.update({where:{id},data});await audit(db,uid,'UPDATE','ProtectedAsset',id);return result;}
 }
 if(resource==='api-keys'){
  if(method==='POST'&&!id){const {name}=z.object({name:z.string().trim().min(1).max(80)}).strict().parse(input);if(await db.apiKey.count({where:{userId:uid,revokedAt:null}})>=10)fail(409,'Revoke an existing key before creating another.');const key='dv_'+randomBytes(32).toString('hex');const result=await db.apiKey.create({data:{userId:uid,name,keyHash:digest(key),prefix:key.slice(0,11)},select:keySelect});await audit(db,uid,'CREATE','ApiKey',result.id);return {...result,key};}
  if(method==='DELETE'&&id){z.object({confirm:z.literal(true)}).strict().parse(input);await owned(db,'apiKey',id,uid,'userId');await db.apiKey.update({where:{id},data:{revokedAt:new Date()}});await audit(db,uid,'REVOKE','ApiKey',id);return {ok:true};}
 }
 if(resource==='simulation'&&method==='POST'&&!id)return simulate(db,uid,simulationSchema.parse(input));
 fail(405,'Method not allowed.');
}
export async function handle(request,{params}) {
 try {
 const parts=params.path||[];if(parts.length>3)fail(404,'Endpoint not found.');for(const part of parts)idSchema.parse(part);
 const method=request.method;const mutation=!['GET','HEAD'].includes(method);let user;
 if(parts.join('/')==='traffic/ingest'&&method==='POST'){
  const key=request.headers.get('authorization')?.match(/^Bearer (dv_[a-f0-9]{64})$/)?.[1];if(!key)fail(401,'Valid ingestion API key required.');
  const entry=await prisma.apiKey.findUnique({where:{keyHash:digest(key)},include:{user:{select:{id:true,role:true}}}});if(!entry||entry.revokedAt||!isAdmin(entry.user.role))fail(401,'Invalid or revoked API key.');user=entry.user;await prisma.apiKey.update({where:{id:entry.id},data:{lastUsedAt:new Date()}});
 }else{user=await currentUser();if(!user)fail(401,'Sign in required.');if(mutation)sameOrigin(request);}
 await limit(`platform:${user.id}:${mutation?'write':'read'}`,mutation?180:600,60);
 const q=querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
 if(!mutation){const result=await listOrRead(prisma,user,parts,q);return result instanceof Response?result:json(result);}
 const input=await body(request);
 const header=request.headers.get('idempotency-key');if(!header)fail(400,'Idempotency-Key header is required.');z.string().min(8).max(100).regex(/^[a-zA-Z0-9_-]+$/).parse(header);
 const receiptId=digest(user.id+':'+header),fingerprint=digest(method+':'+parts.join('/')+':'+JSON.stringify(input));
 const result=await prisma.$transaction(async db=>{
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${receiptId}))`;
  const receipt=await db.mutationReceipt.findUnique({where:{id:receiptId}});if(receipt){if(receipt.fingerprint!==fingerprint)fail(409,'Idempotency key was already used for another request.');if(receipt.result?.oneTimeSecret)fail(409,'This key was already generated. Revoke it and generate a new key if the secret was lost.');return receipt.result;}
  const value=await mutate(db,user,parts,method,input);
  await db.mutationReceipt.create({data:{id:receiptId,userId:user.id,fingerprint,result:value?.key?{oneTimeSecret:true}:JSON.parse(JSON.stringify(value))}});return value;
 },{timeout:30000});return json(result);
 }catch(error){if(error.code==='P2002')return Response.json({error:'A record with these unique fields already exists.'},{status:409});if(error.code==='P2003')return Response.json({error:'This record is still in use.'},{status:409});return errorResponse(error);}
}
