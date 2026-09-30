const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('@prisma/client');
const {fixture,cleanup,client}=require('./platform-fixtures.cjs');
const {evaluateRisk,canManage,isAdmin,csv}=require('../lib/platform/risk.cjs');
const db=new PrismaClient();const base=process.env.TEST_BASE_URL||'http://localhost:3100';
async function ok(response,status=200){assert.equal(response.status,status,await response.clone().text());return response.json();}
(async()=>{
 const baseEvent={requestPath:'/',userAgent:'Browser',metadata:{},eventType:'REQUEST'};
 assert.equal(evaluateRisk(baseEvent).decision,'ALLOW');
 for(const [event,context,rule] of [[{...baseEvent,eventType:'FAILED_LOGIN'},{failedLogins:5},'REPEATED_FAILED_LOGIN'],[baseEvent,{requests:30},'RAPID_REQUESTS'],[{...baseEvent,requestPath:'/.env'},{},'PATH_ENUMERATION'],[baseEvent,{distinctPorts:5},'PORT_SCAN_PATTERN'],[{...baseEvent,userAgent:'scanner'},{},'ABNORMAL_USER_AGENT'],[baseEvent,{deniedRequests:10},'EXCESSIVE_ACCESS'],[baseEvent,{blockedIndicator:true},'BLOCKED_INDICATOR'],[{...baseEvent,requestPath:'/../etc/passwd'},{},'SUSPICIOUS_PAYLOAD']])assert(evaluateRisk(event,context).matchedRules.some(r=>r.name===rule));
 assert.equal(evaluateRisk({...baseEvent,userAgent:'scanner'}).decision,'MONITOR');assert.equal(evaluateRisk({...baseEvent,userAgent:'scanner',requestPath:'/.env'}).decision,'DIVERT');assert.equal(evaluateRisk(baseEvent,{blockedIndicator:true}).decision,'BLOCK');
 assert(canManage('analyst'));assert(!canManage('viewer'));assert(isAdmin('ADMIN'));assert.match(csv([{value:'=HYPERLINK("bad")'}]),/'=HYPERLINK/);
 console.log('PASS defensive risk rules, decisions, role normalization and CSV injection prevention');
 const before=await db.user.findMany({select:{id:true,role:true,email:true,passwordHash:true},orderBy:{id:'asc'}});const users=[];
 try {
 const admin=await fixture(db);users.push(admin.id);const analyst=await fixture(db,'analyst');users.push(analyst.id);const viewer=await fixture(db,'VIEWER');users.push(viewer.id);
 const a=client(base),b=client(base),v=client(base),anon=client(base);
 const reads=['/api/dashboard/summary','/api/dashboard/charts','/api/dashboard/recent-events','/api/dashboard/system-health','/api/traffic','/api/traffic/stream','/api/traffic/export','/api/attack-sessions','/api/ghost-environments','/api/alerts','/api/threat-intelligence/summary','/api/threat-intelligence/trends','/api/threat-intelligence/indicators','/api/threat-intelligence/locations','/api/threat-intelligence/attack-types','/api/reports','/api/settings','/api/assets','/api/api-keys','/api/notifications','/api/simulation'];
 for(const path of reads)assert.equal((await anon.request(path)).status,401,path);
 for(const path of ['/dashboard','/live-traffic','/attack-sessions','/ghost-environments','/alerts','/threat-intelligence','/system-architecture','/reports','/settings','/profile'])assert.equal((await anon.request(path)).status,307,path);
 await a.login(admin);await b.login(analyst);await v.login(viewer);
 assert.equal((await ok(await a.request('/api/auth/session'))).user.id,admin.id);
 for(const path of reads){const r=await a.request(path);assert.equal(r.status,200,path+': '+await r.clone().text());}
 assert.equal((await v.mutate('/api/reports',{})).status,403);assert.equal((await b.mutate('/api/simulation',{action:'start'})).status,403);
 assert.equal((await a.mutate('/api/assets',{},'POST',{origin:'https://evil.invalid'})).status,403);
 assert.equal((await a.request('/api/traffic?pageSize=10000')).status,400);
 assert.equal((await a.request('/api/traffic?range=custom&from=bad')).status,400);
 console.log('PASS protected pages/APIs, original session, RBAC, origin checks and validation');
 const asset=await ok(await a.mutate('/api/assets',{name:'Test API',assetType:'API',hostname:'test-'+admin.id+'.invalid',maskedIpAddress:'198.51.100.xxx',operatingSystem:'Linux',environment:'STAGING'}));
 const envInput={name:'Test Ghost',operatingSystem:'Ubuntu 24.04',serviceTemplate:'HTTP',networkProfile:'ISOLATED',simulationLevel:'MEDIUM',loggingLevel:'STANDARD'};
 const once=randomUUID();const env=await ok(await a.mutate('/api/ghost-environments',envInput,'POST',{'Idempotency-Key':once}));const duplicate=await ok(await a.mutate('/api/ghost-environments',envInput,'POST',{'Idempotency-Key':once}));assert.equal(env.id,duplicate.id);assert.equal((await a.mutate('/api/ghost-environments',{...envInput,name:'Changed'},'POST',{'Idempotency-Key':once})).status,409);
 await ok(await a.mutate('/api/ghost-environments/'+env.id+'/start'));await ok(await a.mutate('/api/ghost-environments/'+env.id,{name:'Updated Ghost'},'PATCH'));
 assert.equal((await b.request('/api/ghost-environments/'+env.id)).status,404);
 const key=await ok(await a.mutate('/api/api-keys',{name:'Test sensor'}));assert(!JSON.stringify(await ok(await a.request('/api/api-keys'))).includes(key.key));assert.equal((await db.apiKey.findUnique({where:{id:key.id}})).keyHash.length,64);
 const eventData={protectedAssetId:asset.id,sourceIp:'198.51.100.24',sourceCountry:'Test Country',requestPath:'/.env',userAgent:'demo-scanner'};
 assert.equal((await a.mutate('/api/traffic/ingest',eventData)).status,401);
 const event=await ok(await anon.mutate('/api/traffic/ingest',eventData,'POST',{Authorization:'Bearer '+key.key}));assert.equal(event.decision,'DIVERT');assert.equal(event.status,'RECOMMENDED');assert.equal(event.simulated,false);assert(event.attackSessionId);
 const filtered=await ok(await a.request('/api/traffic?q=198.51.100&decision=DIVERT&country=Test%20Country&riskMin=60&sort=riskScore&order=asc'));assert.equal(filtered.total,1);
 assert.equal((await b.request('/api/traffic/'+event.id)).status,404);assert.equal((await b.request('/api/traffic')).status,200);assert.equal((await ok(await b.request('/api/traffic'))).total,0);
 assert.equal((await a.mutate('/api/traffic/ingest',{...eventData,ownerId:analyst.id},'POST',{Authorization:'Bearer '+key.key})).status,400);
 await ok(await a.request('/api/traffic/'+event.id));assert.match(await(await a.request('/api/traffic/stream')).text(),/event: traffic/);assert.match(await(await a.request('/api/traffic/export')).text(),/198.51.100.24/);
 const sess='/api/attack-sessions/'+event.attackSessionId;await ok(await a.mutate(sess,{assignedAnalystId:admin.id},'PATCH'));assert.equal((await a.mutate(sess,{assignedAnalystId:analyst.id},'PATCH')).status,403);await ok(await a.mutate(sess+'/notes',{note:'Reviewed inert event'}));await ok(await a.mutate(sess,{status:'COMPLETED'},'PATCH'));assert.equal((await ok(await a.request(sess))).status,'COMPLETED');assert.equal((await ok(await a.request(sess+'/actions'))).items.length,1);assert.match(await(await a.request(sess+'/export')).text(),/Reviewed inert event/);
 console.log('PASS API keys, ingestion, filtering, ownership, idempotency, ghost operations and session management');
 const alert=(await ok(await a.request('/api/alerts'))).items[0];const alertUrl='/api/alerts/'+alert.id;
 await ok(await a.mutate(alertUrl+'/assign',{assignedUserId:admin.id}));await ok(await a.mutate(alertUrl+'/acknowledge'));await ok(await a.mutate(alertUrl,{note:'Investigating'},'PATCH'));await ok(await a.mutate(alertUrl+'/resolve',{resolutionNotes:'Validated defensive recommendation.'}));assert.equal((await ok(await a.request(alertUrl))).status,'RESOLVED');await ok(await a.mutate(alertUrl+'/reopen'));assert.equal((await ok(await a.request(alertUrl))).timeline.length,6);assert.equal((await b.mutate(alertUrl+'/resolve',{resolutionNotes:'Wrong owner'})).status,404);
 const intelligence=await ok(await a.request('/api/threat-intelligence/summary'));assert.equal(intelligence.attackTypes[0].value,1);assert.equal((await ok(await a.request('/api/threat-intelligence/indicators'))).total,1);
 const setting=await ok(await a.request('/api/settings'));await ok(await a.mutate('/api/settings',{...setting,theme:'light',detectionSensitivity:55},'PATCH'));assert.equal((await ok(await a.request('/api/settings'))).theme,'light');assert.equal((await a.mutate('/api/settings',{...setting,monitorThreshold:95},'PATCH')).status,400);
 for(const reportType of ['EXECUTIVE','ATTACK_BEHAVIOUR','GHOST_SESSIONS','THREAT_INTELLIGENCE','SYSTEM_HEALTH']){const report=await ok(await a.mutate('/api/reports',{name:reportType,reportType,dateFrom:new Date(Date.now()-86400000).toISOString(),dateTo:new Date().toISOString()}));const pdf=await a.request('/api/reports/'+report.id+'/download?format=pdf');assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.match(await pdf.text(),/^%PDF-1.4/);assert.equal((await a.request('/api/reports/'+report.id+'/download?format=csv')).status,200);assert.equal((await b.request('/api/reports/'+report.id)).status,404);await ok(await a.mutate('/api/reports/'+report.id,{confirm:true},'DELETE'));}
 console.log('PASS alert timeline/audits, assignments, resolution, intelligence, persisted settings and five report types');
 await ok(await a.mutate('/api/settings',setting,'PATCH'));
 const state=await ok(await a.mutate('/api/simulation',{action:'start',speed:10}));assert.equal(state.running,true);assert.equal(await db.trafficEvent.count({where:{ownerId:admin.id,simulated:true}}),10);
 const simSessions=await db.attackSession.findMany({where:{ownerId:admin.id,simulated:true},include:{actions:true}});assert(simSessions.length>0);assert(simSessions.every(s=>s.actions.every(action=>action.simulated===true)));
 await ok(await a.mutate('/api/simulation',{action:'stop'}));const count=await db.trafficEvent.count({where:{ownerId:admin.id}});await ok(await a.mutate('/api/simulation',{action:'tick'}));assert.equal(await db.trafficEvent.count({where:{ownerId:admin.id}}),count);
 assert.equal((await a.mutate('/api/simulation',{action:'clear'})).status,400);await ok(await a.mutate('/api/simulation',{action:'clear',confirm:true}));assert.equal(await db.trafficEvent.count({where:{ownerId:admin.id,simulated:true}}),0);assert(await db.trafficEvent.findUnique({where:{id:event.id}}));assert(await db.protectedAsset.findUnique({where:{id:asset.id}}));
 assert.equal((await ok(await a.request('/api/dashboard/summary'))).totalTraffic,1);
 await ok(await a.mutate('/api/api-keys/'+key.id,{confirm:true},'DELETE'));assert.equal((await anon.mutate('/api/traffic/ingest',eventData,'POST',{Authorization:'Bearer '+key.key})).status,401);
 const env2=await ok(await a.mutate('/api/ghost-environments',{...envInput,name:'Unused'}));await ok(await a.mutate('/api/ghost-environments/'+env2.id+'/stop'));await ok(await a.mutate('/api/ghost-environments/'+env2.id,{confirm:true},'DELETE'));
 const notifications=await ok(await a.request('/api/notifications'));assert(notifications.total>0);await ok(await a.mutate('/api/notifications/'+notifications.items[0].id,{read:true},'PATCH'));
 console.log('PASS simulation start/stop/tick, inert replay records, safe cleanup, dashboard totals, revocation and notifications');
 }finally{await cleanup(db,users);const after=await db.user.findMany({select:{id:true,role:true,email:true,passwordHash:true},orderBy:{id:'asc'}});assert.deepEqual(after,before);console.log('PASS existing user identities, roles and password hashes preserved');await db.$disconnect();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
