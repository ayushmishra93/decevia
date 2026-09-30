// Dry-run by default. Operational maintenance requires explicit user selection and --apply.
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('@prisma/client');
const {isAdmin}=require('../lib/platform/risk.cjs');
const db=new PrismaClient();
(async()=>{try{
 const index=process.argv.indexOf('--user'),userId=index>=0?process.argv[index+1]:null;if(!userId)throw Error('Usage: npm run db:retention -- --user ADMIN_ID [--apply]');
 const user=await db.user.findUnique({where:{id:userId},include:{settings:true}});if(!user||!isAdmin(user.role))throw Error('An existing administrator is required.');
 const cutoff=new Date(Date.now()-(user.settings?.retentionDays||90)*86400000);
 const count=await db.trafficEvent.count({where:{ownerId:userId,timestamp:{lt:cutoff}}});console.log(`Traffic events older than configured retention: ${count}.`);
 if(!process.argv.includes('--apply')){console.log('Dry run only. Pass --apply to delete expired traffic, resolved alerts, completed sessions, read notifications and old idempotency receipts. Reports and audit logs remain.');return;}
 await db.$transaction(async tx=>{
 await tx.alert.deleteMany({where:{ownerId:userId,status:'RESOLVED',resolvedAt:{lt:cutoff}}});
 await tx.trafficEvent.deleteMany({where:{ownerId:userId,timestamp:{lt:cutoff}}});
 await tx.attackSession.deleteMany({where:{ownerId:userId,status:'COMPLETED',endedAt:{lt:cutoff},trafficEvents:{none:{}},alerts:{none:{}}}});
 await tx.notification.deleteMany({where:{userId,read:true,createdAt:{lt:cutoff}}});
 await tx.mutationReceipt.deleteMany({where:{userId,createdAt:{lt:cutoff}}});
 await tx.auditLog.create({data:{userId,action:'RETENTION_APPLIED',resourceType:'Maintenance',metadata:{cutoff:cutoff.toISOString(),trafficEvents:count}}});
 });console.log('Retention maintenance completed for the selected user.');
 }finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
