// Development-only, deterministic simulated data for an EXISTING administrator.
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('@prisma/client');
const {randomUUID}=require('node:crypto');
const {evaluateRisk,isAdmin}=require('../lib/platform/risk.cjs');
const db=new PrismaClient();
(async()=>{try{
 if(process.env.NODE_ENV==='production'||process.env.SIMULATION_MODE!=='true')throw Error('Requires a development environment with SIMULATION_MODE=true.');
 const index=process.argv.indexOf('--user');const userId=index>=0?process.argv[index+1]:null;
 if(!userId||!process.argv.includes('--confirm'))throw Error('Usage: SIMULATION_MODE=true npm run db:seed -- --user EXISTING_ADMIN_ID --confirm');
 const user=await db.user.findUnique({where:{id:userId}});if(!user||!isAdmin(user.role))throw Error('Select an existing ADMIN; the seed never creates or promotes users.');
 await db.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`seed:${userId}`}))`;
 if(await tx.auditLog.findFirst({where:{userId,action:'DEVELOPMENT_SEED',simulated:true}}))throw Error('Development seed already exists. Clear simulated data before reseeding.');
 const asset=await tx.protectedAsset.create({data:{ownerId:userId,name:'Seed Demo Gateway',assetType:'WEB',hostname:'seed-'+randomUUID()+'.invalid',maskedIpAddress:'192.0.2.xxx',operatingSystem:'Ubuntu 24.04',environment:'DEVELOPMENT',simulated:true}});
 const env=await tx.ghostEnvironment.create({data:{createdById:userId,name:'Seed Ghost '+randomUUID().slice(0,8),operatingSystem:'Ubuntu 24.04',serviceTemplate:'HTTP',networkProfile:'ISOLATED',simulationLevel:'MEDIUM',loggingLevel:'VERBOSE',status:'RUNNING',cpuUsage:18,memoryUsage:28,simulated:true}});
 for(let i=0;i<90;i++){
 const timestamp=new Date(Date.now()-(89-i)*2*3600000);const input={protectedAssetId:asset.id,sourceIp:'192.0.2.'+(10+i%20),sourceCountry:['Fictional North','Fictional South','Fictional East'][i%3],requestPath:['/','/admin','/.env','/../etc/passwd'][i%4],requestMethod:'GET',protocol:['HTTPS','SSH','HTTP'][i%3],userAgent:i%4>1?'demo-scanner':'Demo Browser',eventType:'REQUEST',metadata:{}};
 const risk=evaluateRisk(input);const severity=risk.score>=90?'CRITICAL':risk.score>=60?'HIGH':risk.score>=25?'MEDIUM':'LOW';let session=null;
 if(risk.score>=60){session=await tx.attackSession.create({data:{ownerId:userId,sessionCode:'SEED-'+randomUUID(),sourceIp:input.sourceIp,sourceCountry:input.sourceCountry,attackType:risk.matchedRules[0].name,riskScore:risk.score,status:i>80?'ACTIVE':'COMPLETED',startedAt:timestamp,endedAt:i>80?null:new Date(timestamp.getTime()+60000),ghostEnvironmentId:env.id,protectedAssetId:asset.id,simulated:true}});await tx.sessionAction.create({data:{attackSessionId:session.id,timestamp,actionType:'COMMAND',commandText:'whoami',result:'ghost-user (fictional stored output)',severity:'LOW',simulated:true}});}
 const event=await tx.trafficEvent.create({data:{...input,ownerId:userId,timestamp,riskScore:risk.score,decision:risk.decision,status:risk.decision==='DIVERT'?'DIVERTED':risk.decision==='BLOCK'?'BLOCKED':'OBSERVED',attackSessionId:session?.id,simulated:true,riskDecision:{create:{...risk,createdAt:timestamp,simulated:true}}}});
 if(session){const alert=await tx.alert.create({data:{ownerId:userId,title:'Simulated '+risk.decision,description:risk.explanation,severity,category:session.attackType,source:'SIMULATOR',trafficEventId:event.id,attackSessionId:session.id,ghostEnvironmentId:env.id,createdAt:timestamp,simulated:true}});await tx.auditLog.create({data:{userId,action:'CREATED',resourceType:'Alert',resourceId:alert.id,createdAt:timestamp,simulated:true}});await tx.notification.create({data:{userId,title:alert.title,message:risk.explanation,type:'ALERT',createdAt:timestamp,simulated:true}});await tx.threatIndicator.upsert({where:{ownerId_indicatorType_value_simulated:{ownerId:userId,indicatorType:'IP',value:input.sourceIp,simulated:true}},create:{ownerId:userId,indicatorType:'IP',value:input.sourceIp,confidence:risk.score,severity,description:risk.explanation,firstSeen:timestamp,lastSeen:timestamp,simulated:true},update:{lastSeen:timestamp,occurrenceCount:{increment:1}}});}
 }
 await tx.auditLog.create({data:{userId,action:'DEVELOPMENT_SEED',resourceType:'Simulation',simulated:true}});
 },{timeout:30000});console.log('Added 90 fictional events and related simulated records to the selected existing administrator.');
 }finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
