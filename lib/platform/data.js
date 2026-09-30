import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { evaluateRisk } from './risk.cjs';
import { dateWhere } from './validation';
export function fail(status,message){throw Object.assign(new Error(message),{status});}
export async function owned(db,model,id,userId,field='ownerId') { const row=await db[model].findFirst({where:{id,[field]:userId}});if(!row)fail(404,'Record not found.');return row; }
export async function audit(db,userId,action,resourceType,resourceId,metadata={},simulated=false) {return db.auditLog.create({data:{userId,action,resourceType,resourceId,metadata,simulated}});}
export async function notify(db,userId,title,message,type,simulated=false) {
 const s=await db.userSettings.findUnique({where:{userId}});
 if(s?.notificationPreferences?.[type==='SIMULATION'?'simulation':'alerts']===false)return;
 return db.notification.create({data:{userId,title,message,type,simulated}});
}
export function trafficWhere(userId,q){return {ownerId:userId,timestamp:dateWhere(q),riskScore:{gte:q.riskMin,lte:q.riskMax},...(q.decision?{decision:q.decision}:{}),...(q.country?{sourceCountry:q.country}:{}),...(q.status?{status:q.status}:{}),...(q.q?{OR:[{sourceIp:{contains:q.q,mode:'insensitive'}},{requestPath:{contains:q.q,mode:'insensitive'}}]}:{})};}
export async function ingest(db,userId,input,simulated=false) {
 await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`ingest:${userId}:${input.sourceIp}`}))`;
 const asset=await owned(db,'protectedAsset',input.protectedAssetId,userId);
 if(asset.status!=='ACTIVE')fail(409,'This protected asset is inactive.');
 if(asset.simulated!==simulated)fail(400,'Sensor events require a real asset; simulation requires a simulated asset.');
 const since=new Date(Date.now()-60000);
 const recent=await db.trafficEvent.findMany({where:{ownerId:userId,sourceIp:input.sourceIp,timestamp:{gte:since},simulated},select:{eventType:true,metadata:true},take:1000});
 const settings=await db.userSettings.findUnique({where:{userId}});
 const blocked=await db.threatIndicator.findFirst({where:{ownerId:userId,indicatorType:'IP',value:input.sourceIp,confidence:{gte:90},severity:'CRITICAL',simulated}});
 const ports=new Set([...recent.map(e=>e.metadata?.destinationPort),input.metadata?.destinationPort].filter(Boolean));
 const risk=evaluateRisk(input,{requests:recent.length+1,failedLogins:recent.filter(e=>e.eventType==='FAILED_LOGIN').length+(input.eventType==='FAILED_LOGIN'?1:0),deniedRequests:recent.filter(e=>e.eventType==='ACCESS_DENIED').length+(input.eventType==='ACCESS_DENIED'?1:0),distinctPorts:ports.size,blockedIndicator:!!blocked},settings||{});
 // This release records simulated diversion only; sensor decisions are recommendations.
 let attackSession=null;let ghost=null;
 if(risk.score>=(settings?.divertThreshold??60)) {
  if(simulated&&risk.decision==='DIVERT')ghost=await db.ghostEnvironment.findFirst({where:{createdById:userId,status:'RUNNING',simulated:true},orderBy:{updatedAt:'desc'}});
  attackSession=await db.attackSession.create({data:{ownerId:userId,sessionCode:'GS-'+randomUUID(),sourceIp:input.sourceIp,sourceCountry:input.sourceCountry,attackType:risk.matchedRules[0]?.name||'SUSPICIOUS_ACTIVITY',riskScore:risk.score,protectedAssetId:asset.id,ghostEnvironmentId:ghost?.id,simulated}});
  if(simulated&&ghost)await db.sessionAction.createMany({data:[{attackSessionId:attackSession.id,actionType:'COMMAND',commandText:'whoami',result:'ghost-user (simulated output)',severity:'LOW',simulated:true},{attackSessionId:attackSession.id,actionType:'FILE_ACCESS',commandText:'cat /decoy/readme.txt',filePath:'/decoy/readme.txt',result:'Fictional decoy file observed. No command was executed.',severity:'MEDIUM',simulated:true}]});
 }
 const status=simulated?(risk.decision==='DIVERT'?(ghost?'DIVERTED':'NO_ENVIRONMENT'):risk.decision==='BLOCK'?'BLOCKED':'OBSERVED'):'RECOMMENDED';
 const event=await db.trafficEvent.create({data:{...input,ownerId:userId,riskScore:risk.score,decision:risk.decision,status,simulated,attackSessionId:attackSession?.id,riskDecision:{create:{...risk,simulated}}},include:{riskDecision:true}});
 if(risk.score>=60){
  const severity=risk.score>=90?'CRITICAL':'HIGH';
  const alert=await db.alert.create({data:{ownerId:userId,title:`${risk.decision}: ${input.sourceIp}`,description:risk.explanation,severity,category:attackSession?.attackType||'RISK',source:simulated?'SIMULATOR':'SENSOR',trafficEventId:event.id,attackSessionId:attackSession?.id,ghostEnvironmentId:ghost?.id,simulated}});
  await audit(db,userId,'CREATED','Alert',alert.id,{},simulated);
  await notify(db,userId,alert.title,alert.description,'ALERT',simulated);
  await db.threatIndicator.upsert({where:{ownerId_indicatorType_value_simulated:{ownerId:userId,indicatorType:'IP',value:input.sourceIp,simulated}},create:{ownerId:userId,indicatorType:'IP',value:input.sourceIp,confidence:risk.score,severity,description:risk.explanation,simulated},update:{lastSeen:new Date(),occurrenceCount:{increment:1},confidence:risk.score,severity}});
 }
 return event;
}
export async function summary(db,userId,q,scope={}) {
 const eventWhere={ownerId:userId,timestamp:dateWhere(q),...scope};
 const sessionWhere={ownerId:userId,startedAt:dateWhere(q),...scope};
 const [totalTraffic,threatsDiverted,diversionCandidates,activeGhostSessions,protectedSystems,criticalAlerts,decisions,severity,attacks,services,countries,traffic,events,sessions,alerts,environments,commands]=await Promise.all([
 db.trafficEvent.count({where:eventWhere}),db.trafficEvent.count({where:{...eventWhere,status:'DIVERTED'}}),db.trafficEvent.count({where:{...eventWhere,decision:'DIVERT'}}),
 db.attackSession.count({where:{...sessionWhere,status:'ACTIVE',ghostEnvironmentId:{not:null}}}),db.protectedAsset.count({where:{ownerId:userId,status:'ACTIVE',...scope}}),db.alert.count({where:{ownerId:userId,severity:'CRITICAL',status:{not:'RESOLVED'},createdAt:dateWhere(q),...scope}}),
 db.trafficEvent.groupBy({by:['decision'],where:eventWhere,_count:true}),db.alert.groupBy({by:['severity'],where:{ownerId:userId,createdAt:dateWhere(q),...scope},_count:true}),db.attackSession.groupBy({by:['attackType'],where:sessionWhere,_count:true,orderBy:{_count:{attackType:'desc'}},take:20}),
 db.trafficEvent.groupBy({by:['protocol'],where:eventWhere,_count:true,orderBy:{_count:{protocol:'desc'}}}),db.trafficEvent.groupBy({by:['sourceCountry'],where:{...eventWhere,riskScore:{gte:25}},_count:true,orderBy:{_count:{sourceCountry:'desc'}},take:20}),
 db.$queryRaw(Prisma.sql`SELECT to_char(date_trunc('day', "timestamp" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS name, count(*)::int AS value FROM "TrafficEvent" WHERE "ownerId"=${userId} ${eventWhere.timestamp.gte?Prisma.sql`AND "timestamp">=${eventWhere.timestamp.gte} AND "timestamp"<=${eventWhere.timestamp.lte}`:Prisma.empty} ${scope.simulated!==undefined?Prisma.sql`AND "simulated"=${scope.simulated}`:Prisma.empty} GROUP BY 1 ORDER BY 1 DESC LIMIT 366`),
 db.trafficEvent.findMany({where:eventWhere,orderBy:{timestamp:'desc'},take:8}),db.attackSession.findMany({where:{...sessionWhere,status:'ACTIVE'},orderBy:{startedAt:'desc'},take:8}),db.alert.findMany({where:{ownerId:userId,severity:'CRITICAL',status:{not:'RESOLVED'},createdAt:dateWhere(q),...scope},orderBy:{createdAt:'desc'},take:8}),db.ghostEnvironment.findMany({where:{createdById:userId,...scope},orderBy:{createdAt:'desc'},take:20}),
 db.sessionAction.groupBy({by:['commandText'],where:{attackSession:{ownerId:userId},timestamp:dateWhere(q),commandText:{not:null},...scope},_count:true,orderBy:{_count:{commandText:'desc'}},take:20})]);
 const riskBuckets=await Promise.all([[0,24],[25,59],[60,89],[90,100]].map(([gte,lte])=>db.trafficEvent.count({where:{...eventWhere,riskScore:{gte,lte}}})));
 const group=(rows,key)=>rows.map(r=>({name:r[key],value:r._count}));
 return {stats:{totalTraffic,threatsDiverted,activeGhostSessions,protectedSystems,criticalAlerts,diversionSuccessRate:diversionCandidates?Math.round(threatsDiverted/diversionCandidates*100):0},charts:{traffic:traffic.reverse(),severity:group(severity,'severity'),attackTypes:group(attacks,'attackType'),services:group(services,'protocol'),locations:group(countries,'sourceCountry'),decisions:group(decisions,'decision'),risk:['LOW','MEDIUM','HIGH','CRITICAL'].map((name,i)=>({name,value:riskBuckets[i]})),commands:group(commands,'commandText')},events,sessions,alerts,environments};
}
export async function health(db,userId) {
 const [count,last,environments,actions,activeAssets]=await Promise.all([db.trafficEvent.count({where:{ownerId:userId}}),db.trafficEvent.findFirst({where:{ownerId:userId},orderBy:{timestamp:'desc'},select:{timestamp:true}}),db.ghostEnvironment.findMany({where:{createdById:userId},select:{id:true,name:true,operatingSystem:true,serviceTemplate:true,status:true,isolationStatus:true,cpuUsage:true,memoryUsage:true,updatedAt:true}}),db.sessionAction.count({where:{attackSession:{ownerId:userId}}}),db.protectedAsset.count({where:{ownerId:userId,status:'ACTIVE'}})]);
 const running=environments.filter(e=>e.status==='RUNNING').length;
 return {database:'AVAILABLE',activeAssets,mode:'SIMULATOR_AND_SENSOR_ANALYSIS',components:['Perimeter Monitoring Layer','Decision and Diversion Engine','Ghost Environment','Isolation Sandbox','Behaviour Recorder','Dashboard Layer'].map((name,i)=>({name,status:i===5?'AVAILABLE':i===2||i===3?(running?'SIMULATED':'IDLE'):count?'AVAILABLE':'NO_DATA',lastActivity:i===2||i===3?environments[0]?.updatedAt||null:last?.timestamp||null,processedEventCount:i===4?actions:i===2||i===3?running:count,healthPercentage:i===5?100:i===2||i===3?(environments.length?Math.round(running/environments.length*100):null):count?100:null,error:null})),environments};
}
export async function simulate(db,userId,input) {
 if(process.env.SIMULATION_MODE!=='true')fail(403,'Simulation is disabled. Set SIMULATION_MODE=true on the server.');
 // Serialize ticks, start/stop and cleanup for this user across workers.
 await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`simulation:${userId}`}))`;
 let state=await db.simulationState.upsert({where:{userId},create:{userId},update:{}});
 if(input.action==='clear') {
  if(!input.confirm)fail(400,'Explicit confirmation is required.');
  await db.simulationState.update({where:{userId},data:{running:false}});
  // Never cascade-delete real dependents. Detach optional references, retain any parents still used by real data.
  await db.alert.deleteMany({where:{ownerId:userId,simulated:true}});
  await db.notification.deleteMany({where:{userId,simulated:true}});
  await db.threatIndicator.deleteMany({where:{ownerId:userId,simulated:true}});
  await db.report.deleteMany({where:{generatedById:userId,simulated:true}});
  await db.riskDecision.deleteMany({where:{simulated:true,trafficEvent:{ownerId:userId,simulated:true}}});
  await db.trafficEvent.deleteMany({where:{ownerId:userId,simulated:true,riskDecision:{is:null}}});
  await db.sessionAction.deleteMany({where:{simulated:true,attackSession:{ownerId:userId}}});
  await db.attackSession.deleteMany({where:{ownerId:userId,simulated:true,actions:{none:{}},trafficEvents:{none:{}},alerts:{none:{}}}});
  await db.ghostEnvironment.deleteMany({where:{createdById:userId,simulated:true,attackSessions:{none:{}},alerts:{none:{}}}});
  await db.protectedAsset.deleteMany({where:{ownerId:userId,simulated:true,trafficEvents:{none:{}},attackSessions:{none:{}}}});
  await db.auditLog.deleteMany({where:{userId,simulated:true}});
  await audit(db,userId,'CLEAR_SIMULATED_DATA','Simulation',userId);
  return {running:false,cleared:true};
 }
 if(input.action==='stop'){state=await db.simulationState.update({where:{userId},data:{running:false}});await audit(db,userId,'STOP','Simulation',userId);return state;}
 if(input.action==='start'){state=await db.simulationState.update({where:{userId},data:{running:true,speed:input.speed||1,lastTick:new Date(0)}});await audit(db,userId,'START','Simulation',userId);await notify(db,userId,'Simulation started','Fictional traffic generation enabled while this dashboard is open.','SIMULATION',true);}
 if(!state.running||Date.now()-state.lastTick.getTime()<4000)return state;
 const asset=await db.protectedAsset.upsert({where:{ownerId_hostname:{ownerId:userId,hostname:'demo.decevia.invalid'}},create:{ownerId:userId,name:'Simulated Web Gateway',hostname:'demo.decevia.invalid',assetType:'WEB',maskedIpAddress:'192.0.2.xxx',operatingSystem:'Ubuntu 24.04',environment:'DEVELOPMENT',simulated:true},update:{}});
 let env=await db.ghostEnvironment.findFirst({where:{createdById:userId,simulated:true}});
 if(!env)env=await db.ghostEnvironment.create({data:{createdById:userId,name:'Demo Ghost '+randomUUID().slice(0,8),operatingSystem:'Ubuntu 24.04',serviceTemplate:'HTTP',networkProfile:'ISOLATED',simulationLevel:'MEDIUM',loggingLevel:'STANDARD',status:'RUNNING',simulated:true}});
 for(let i=0;i<state.speed;i++) {
 const n=(i+Math.floor(Date.now()/5000))%5;
 await ingest(db,userId,{protectedAssetId:asset.id,sourceIp:`192.0.2.${10+Math.floor(Math.random()*190)}`,sourceCountry:['Fictional North','Fictional South','Fictional East'][n%3],requestPath:['/','/admin','/.env','/search?q=union select','/../etc/passwd'][n],requestMethod:'GET',protocol:'HTTPS',userAgent:n>1?'demo-scanner':'Demo Browser',eventType:'REQUEST',metadata:{}},true);
 }
 await db.ghostEnvironment.updateMany({where:{createdById:userId,simulated:true,status:'RUNNING'},data:{cpuUsage:Math.round(Math.random()*45+5),memoryUsage:Math.round(Math.random()*35+15)}});
 return db.simulationState.update({where:{userId},data:{lastTick:new Date()}});
}
