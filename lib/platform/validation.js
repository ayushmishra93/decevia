import { z } from 'zod';
const text = (max = 120) => z.string().trim().min(1).max(max);
export const idSchema = text(100).regex(/^[a-zA-Z0-9_-]+$/);
export const querySchema = z.object({
 page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25),
 q: z.string().trim().max(150).default(''), range: z.enum(['today','7d','30d','custom','all']).default('7d'),
 from: z.iso.datetime({offset:true}).optional(), to: z.iso.datetime({offset:true}).optional(),
 riskMin: z.coerce.number().int().min(0).max(100).default(0), riskMax: z.coerce.number().int().min(0).max(100).default(100),
 decision: z.enum(['ALLOW','MONITOR','DIVERT','BLOCK']).optional(), country: text(80).optional(), status: text(40).optional(), severity: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).optional(), attackType: text(100).optional(),
 sort: z.enum(['timestamp','riskScore','sourceIp','createdAt','startedAt']).default('timestamp'), order: z.enum(['asc','desc']).default('desc'), format:z.enum(['csv','pdf']).default('csv')
}).refine(v=>v.riskMin<=v.riskMax, 'Invalid risk range').refine(v=>v.range!=='custom'||(v.from&&v.to&&new Date(v.from)<=new Date(v.to)), 'Invalid custom date range');
export function dateWhere(q) {
 if(q.range==='all')return {};
 const now=new Date();const end=q.range==='custom'?new Date(q.to):now;
 const start=q.range==='custom'?new Date(q.from):q.range==='today'?new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())):new Date(now.getTime()-(q.range==='30d'?30:7)*86400000);
 return {gte:start,lte:end};
}
export const ingestSchema = z.object({
 protectedAssetId:idSchema, sourceIp:z.union([z.ipv4(),z.ipv6()]), sourceCountry:text(80), requestPath:text(2048), requestMethod:z.enum(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS']).default('GET'), protocol:z.enum(['HTTP','HTTPS','SSH','TCP','UDP']).default('HTTPS'), userAgent:z.string().max(300).default(''), eventType:z.enum(['REQUEST','FAILED_LOGIN','ACCESS_DENIED','CONNECTION']).default('REQUEST'),
 metadata:z.object({destinationPort:z.number().int().min(1).max(65535).optional(),payload:z.string().max(2000).optional()}).strict().default({})
}).strict();
export const environmentSchema=z.object({name:text(100),operatingSystem:z.enum(['Ubuntu 24.04','Windows Server 2022','Debian 12']),serviceTemplate:z.enum(['HTTP','SSH','Database','Identity']),networkProfile:z.enum(['ISOLATED']).default('ISOLATED'),simulationLevel:z.enum(['LOW','MEDIUM','HIGH']).default('MEDIUM'),loggingLevel:z.enum(['STANDARD','VERBOSE']).default('STANDARD')}).strict();
export const assetSchema=z.object({name:text(),assetType:z.enum(['WEB','API','DATABASE','IDENTITY','HOST']),hostname:text(253).regex(/^[a-zA-Z0-9.-]+$/),maskedIpAddress:text(80),operatingSystem:text(),environment:z.enum(['PRODUCTION','STAGING','DEVELOPMENT']),status:z.enum(['ACTIVE','INACTIVE']).default('ACTIVE')}).strict();
export const settingsSchema=z.object({notificationPreferences:z.object({alerts:z.boolean(),simulation:z.boolean()}).strict(),detectionSensitivity:z.number().int().min(0).max(100),monitorThreshold:z.number().int().min(1).max(98),divertThreshold:z.number().int().min(2).max(99),blockThreshold:z.number().int().min(3).max(100),ghostDefaults:z.object({operatingSystem:z.enum(['Ubuntu 24.04','Windows Server 2022','Debian 12']).optional(),serviceTemplate:z.enum(['HTTP','SSH','Database','Identity']).optional(),loggingLevel:z.enum(['STANDARD','VERBOSE']).optional()}).strict(),retentionDays:z.number().int().min(1).max(3650),theme:z.enum(['dark','light','system'])}).strict().refine(v=>v.monitorThreshold<v.divertThreshold&&v.divertThreshold<v.blockThreshold,'Thresholds must increase.');
export const noteSchema=z.object({note:text(4000)}).strict();
export const sessionPatch=z.object({status:z.enum(['ACTIVE','COMPLETED']).optional(),assignedAnalystId:idSchema.nullable().optional()}).strict();
export const alertPatch=z.object({note:text(4000).optional(),status:z.enum(['OPEN','INVESTIGATING','RESOLVED']).optional(),assignedUserId:idSchema.nullable().optional(),resolutionNotes:text(4000).optional()}).strict();
export const reportSchema=z.object({name:text(),reportType:z.enum(['EXECUTIVE','ATTACK_BEHAVIOUR','GHOST_SESSIONS','THREAT_INTELLIGENCE','SYSTEM_HEALTH']),dateFrom:z.iso.datetime({offset:true}),dateTo:z.iso.datetime({offset:true}),dataScope:z.enum(['all','simulated','real']).default('all')}).strict().refine(v=>new Date(v.dateFrom)<=new Date(v.dateTo)&&new Date(v.dateTo)-new Date(v.dateFrom)<=366*86400000,'Select a date range of at most 366 days.');
export const simulationSchema=z.object({action:z.enum(['start','stop','tick','clear']),speed:z.number().int().min(1).max(10).optional(),confirm:z.literal(true).optional()}).strict();
