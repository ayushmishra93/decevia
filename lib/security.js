import { createHash } from 'crypto';
import { prisma } from './prisma';
export async function limit(key, maximum=15, seconds=900) {
 const bucket=Math.floor(Date.now()/(seconds*1000));
 const id=createHash('sha256').update(`${key}:${bucket}`).digest('hex');
 const row=await prisma.rateLimit.upsert({where:{id},create:{id,count:1,expires:new Date((bucket+1)*seconds*1000)},update:{count:{increment:1}}});
 if(row.count>maximum) throw Object.assign(new Error('Too many attempts. Please try again later.'),{status:429});
}
export function ip(request) { return process.env.TRUST_PROXY==='true' ? (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown') : 'shared'; }
export { sameOrigin } from './request-origin';
export async function body(request) {const text=await request.text();if(text.length>16000)throw Object.assign(new Error('Request too large.'),{status:413});try{return JSON.parse(text)}catch{throw Object.assign(new Error('Invalid JSON.'),{status:400})}}
export function errorResponse(error) {if(error.name==='ZodError')return Response.json({error:'Check the highlighted fields.',fields:error.flatten().fieldErrors},{status:400});if(error.code==='P2002'){const fields={};for(const key of error.meta?.target||[])fields[key]=['Already in use.'];return Response.json({error:'Email or username is already in use.',fields},{status:409})}return Response.json({error:error.status ? error.message : 'Unable to complete this request. Please try again.'},{status:error.status||500});}
