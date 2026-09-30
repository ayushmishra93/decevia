import NextAuth from 'next-auth';
import { decode as decodeJWT } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { loginSchema } from './validation';
import { limit } from './security';
const adapter=PrismaAdapter(prisma);
export const authOptions={
 secret:process.env.AUTH_SECRET,
 adapter:{...adapter,async createUser(data){return prisma.user.create({data:{...data,email:data.email?.toLowerCase(),provider:'oauth'}})}},
 jwt:{async decode(params){const token=await decodeJWT(params);if(!token?.sid)return null;const row=await prisma.session.findUnique({where:{sessionToken:token.sid}});return row&&row.expires>new Date()?token:null;}},
 session:{strategy:'jwt',maxAge:30*24*60*60},
 pages:{signIn:'/login',error:'/login',newUser:'/auth/continue?new=1'},
 useSecureCookies:process.env.NODE_ENV==='production',
 providers:[
 CredentialsProvider({name:'Email and password',credentials:{email:{},password:{},remember:{}},async authorize(credentials){
  const parsed=loginSchema.safeParse(credentials);if(!parsed.success)return null;
  await limit(`login:${parsed.data.email}`,10);
  const user=await prisma.user.findUnique({where:{email:parsed.data.email}});
  const valid=await bcrypt.compare(parsed.data.password,user?.passwordHash||'$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW');
  if(!user?.passwordHash||!valid)return null;
  return {id:user.id,name:user.name,email:user.email,image:user.image,remember:credentials.remember==='true'};
 }}),
 ...(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET?[GoogleProvider({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET})]:[]),
 ...(process.env.GITHUB_ID&&process.env.GITHUB_SECRET?[GitHubProvider({clientId:process.env.GITHUB_ID,clientSecret:process.env.GITHUB_SECRET,authorization:{params:{scope:'read:user user:email'}},async profile(profile){const candidate=profile.login?.toLowerCase();const available=candidate&&/^[a-z0-9_.]{3,20}$/.test(candidate)&&!await prisma.user.findUnique({where:{username:candidate}});return {id:String(profile.id),name:profile.name||profile.login,email:profile.email,image:profile.avatar_url,username:available?candidate:null};}})]:[])
 ],
 callbacks:{
  async signIn({user,account,profile}){
   if(account.provider==='credentials')return true;
   if(account.provider==='google'&&profile.email_verified!==true)return '/login?error=UnverifiedEmail';
   if(account.provider==='github'){
    const res=await fetch('https://api.github.com/user/emails',{headers:{Authorization:`Bearer ${account.access_token}`,Accept:'application/vnd.github+json'},cache:'no-store'});
    if(!res.ok)return '/login?error=OAuthCallback';
    const emails=await res.json();const verified=emails.find(e=>e.primary&&e.verified)||emails.find(e=>e.verified);
    if(!verified)return '/verify-email';user.email=verified.email.toLowerCase();
   }
   if(!user.email)return '/verify-email';
   user.email=user.email.toLowerCase();
   // Keep Auth.js's default account-linking protection. Existing email owners must sign in first.
   return true;
  },
  async jwt({token,user,account}){
   if(user){
    const seconds=account?.provider==='credentials'&&!user.remember?8*3600:30*86400;
    const row=await prisma.session.create({data:{sessionToken:randomUUID(),userId:user.id,expires:new Date(Date.now()+seconds*1000)}});
    token.sid=row.sessionToken;token.sub=user.id;
   }
   return token;
  },
  async session({session,token}){
   const row=token.sid?await prisma.session.findUnique({where:{sessionToken:token.sid},include:{user:true}}):null;
   if(!row||row.expires<=new Date()){session.user=null;return session;}
   session.user={id:row.user.id,name:row.user.name,username:row.user.username,email:row.user.email,image:row.user.image,role:row.user.role};
   session.sessionId=token.sid;return session;
  },
  async redirect({url,baseUrl}){if(url.startsWith('/')&&!url.startsWith('//'))return baseUrl+url;try{if(new URL(url).origin===baseUrl)return url}catch{}return baseUrl+'/dashboard';}
 },
 events:{async linkAccount({user,account,profile}){await prisma.user.update({where:{id:user.id},data:{...(profile?.email?.toLowerCase()===user.email?.toLowerCase()?{emailVerified:new Date()}:{}),...(user.provider==='oauth'?{provider:account.provider}:{})}})},async signOut({token}){if(token?.sid)await prisma.session.deleteMany({where:{sessionToken:token.sid}})}}
};
export const authHandler=NextAuth(authOptions);
export async function currentUser(){const session=await getServerSession(authOptions);if(!session?.user)return null;return prisma.user.findUnique({where:{id:session.user.id},include:{accounts:{select:{id:true,provider:true}}}});}
export async function requireUser(complete=true){const user=await currentUser();if(!user)redirect('/login');if(complete&&(!user.username||!user.termsAcceptedAt))redirect('/complete-profile');return user;}
