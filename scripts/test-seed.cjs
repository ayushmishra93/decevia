const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('@prisma/client');
const {fixture,cleanup}=require('./platform-fixtures.cjs');
const db=new PrismaClient();
(async()=>{let user;try{
 user=await fixture(db);
 const run=(script,args=[])=>spawnSync(process.execPath,['scripts/'+script,'--user',user.id,...args],{encoding:'utf8',env:{...process.env,NODE_ENV:'development',SIMULATION_MODE:'true'}});
 let result=run('seed.cjs',['--confirm']);assert.equal(result.status,0,result.stderr);assert.equal(await db.trafficEvent.count({where:{ownerId:user.id,simulated:true}}),90);assert.equal(await db.riskDecision.count({where:{trafficEvent:{ownerId:user.id},simulated:true}}),90);
 result=run('seed.cjs',['--confirm']);assert.equal(result.status,1);assert.equal(await db.trafficEvent.count({where:{ownerId:user.id}}),90);
 await db.userSettings.create({data:{userId:user.id,retentionDays:1}});result=run('retention.cjs');assert.equal(result.status,0,result.stderr);assert.equal(await db.trafficEvent.count({where:{ownerId:user.id}}),90);
 result=run('retention.cjs',['--apply']);assert.equal(result.status,0,result.stderr);assert(await db.trafficEvent.count({where:{ownerId:user.id}})<90);assert(await db.user.findUnique({where:{id:user.id}}));assert(await db.auditLog.count({where:{userId:user.id,action:'RETENTION_APPLIED'}}));console.log('PASS development seed, duplicate prevention, retention dry run and isolated retention application');
 }finally{if(user)await cleanup(db,[user.id]);await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
