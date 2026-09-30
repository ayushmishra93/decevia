const assert = require('node:assert/strict');
require('@next/env').loadEnvConfig(process.cwd());
const {PrismaClient}=require('@prisma/client');
const bcrypt=require('bcryptjs');
const db=new PrismaClient();
const base=process.env.TEST_BASE_URL||'http://localhost:3100';
// Match the Origin sent by a browser visiting the test server.
const origin=new URL(base).origin;
const jar=new Map();
async function request(path,options={}){const response=await fetch(base+path,{redirect:'manual',...options,headers:{origin,cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; '),...options.headers}});for(const cookie of response.headers.getSetCookie()){const pair=cookie.split(';')[0],i=pair.indexOf('=');jar.set(pair.slice(0,i),pair.slice(i+1));}return response;}
// Next.js may emit a redirect in streamed HTML after a loading boundary flushes.
async function expectRedirect(response,path){if(response.status===307){assert.equal(new URL(response.headers.get('location'),base).pathname,path);return;}assert.equal(response.status,200);const html=await response.text();assert(html.includes('http-equiv="refresh"')&&html.includes('url='+path+'"'),'Expected a streamed redirect to '+path);}
async function json(path,data,method='POST'){return request(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})}
async function login(email,password){const csrf=await (await request('/api/auth/csrf')).json();return request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken:csrf.csrfToken,email,password,remember:'true',json:'true',callbackUrl:base+'/dashboard'})})}
(async()=>{const stamp=Date.now().toString(36);const email=`auth-test-${stamp}@example.com`,username=`test_${stamp}`,password='ValidPassword42!';let id;try{
 for(const route of ['/profile','/dashboard','/live-traffic','/attack-sessions','/ghost-environments','/threat-intelligence','/alerts','/reports','/settings']){const r=await request(route);assert.equal(r.status,307);assert.match(r.headers.get('location'),/\/login/)}
 console.log('PASS logged-out protected routes');
 const data={name:'Integration Test',username,email,password,confirmPassword:password,terms:true};
 assert.equal((await json('/api/signup',{...data,password:'weak'})).status,400);
 assert.equal((await json('/api/signup',data)).status,201);
 const user=await db.user.findUnique({where:{email}});id=user.id;assert.notEqual(user.passwordHash,password);assert(await bcrypt.compare(password,user.passwordHash));
 assert.equal((await json('/api/signup',{...data,username:username+'x'})).status,409);
 assert.equal((await json('/api/signup',{...data,email:'other-'+email})).status,409);
 console.log('PASS registration, password hashing, validation, duplicate email and username');
 const bad=await (await login(email,'Incorrect42!')).json();assert.match(bad.url,/CredentialsSignin/);
 await login(email,password);const session=await (await request('/api/auth/session')).json();assert.equal(session.user.id,id);
 const cookie=jar.get('next-auth.session-token');assert(cookie);
 assert.equal((await request('/profile?welcome=1')).status,200);assert.equal((await request('/dashboard')).status,200);
 await expectRedirect(await request('/login'),'/dashboard');await expectRedirect(await request('/signup'),'/dashboard');
 console.log('PASS credential login, signup profile, dashboard and authenticated redirects');
 assert.equal((await json('/api/profile',{name:'Updated Name',username,bio:'Security engineer',jobTitle:'Engineer',organization:'Test Org',location:'Remote',image:''},'PATCH')).status,200);
 assert.equal((await db.user.findUnique({where:{id}})).name,'Updated Name');assert.match(await (await request('/profile')).text(),/Updated Name/);
 console.log('PASS persisted profile updates');
 const csrf=await (await request('/api/auth/csrf')).json();await request('/api/auth/signout',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken:csrf.csrfToken,json:'true',callbackUrl:base+'/login'})});
 assert.equal(await db.session.count({where:{userId:id}}),0);
 jar.set('next-auth.session-token',cookie);await expectRedirect(await request('/profile'),'/login');
 console.log('PASS logout deletes session and replayed cookie is rejected');
 }finally{if(id)await db.user.delete({where:{id}});await db.$disconnect()}})().catch(e=>{console.error(e);process.exitCode=1});
