import { authHandler } from '@/lib/auth';
import { limit,ip,errorResponse } from '@/lib/security';
export const runtime='nodejs';
async function handler(request,context){try{if(request.method==='POST'||new URL(request.url).pathname.includes('/callback/'))await limit(`auth:${ip(request)}`,100);return await authHandler(request,context);}catch(error){return errorResponse(error)}}
export {handler as GET,handler as POST};
