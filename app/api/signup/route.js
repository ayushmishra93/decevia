import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validation';
import { sameOrigin,limit,ip,body,errorResponse } from '@/lib/security';
export async function POST(request){try{sameOrigin(request);await limit(`signup:${ip(request)}`,10);const data=signupSchema.parse(await body(request));const existing=await prisma.user.findFirst({where:{OR:[{email:data.email},{username:data.username}]}});if(existing)return Response.json({error:'Email or username is already in use.',fields:{...(existing.email===data.email?{email:['Already in use.']} : {}),...(existing.username===data.username?{username:['Already in use.']}:{})}},{status:409});await prisma.user.create({data:{name:data.name,username:data.username,email:data.email,passwordHash:await bcrypt.hash(data.password,12),provider:'credentials',termsAcceptedAt:new Date()}});return Response.json({ok:true},{status:201});}catch(error){return errorResponse(error)}}
