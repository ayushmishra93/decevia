import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
export async function middleware(request){const token=await getToken({req:request,secret:process.env.AUTH_SECRET});if(!token)return NextResponse.redirect(new URL('/login',request.url));return NextResponse.next();}
export const config={matcher:['/system-architecture/:path*','/dashboard/:path*','/profile/:path*','/complete-profile','/live-traffic/:path*','/attack-sessions/:path*','/ghost-environments/:path*','/threat-intelligence/:path*','/alerts/:path*','/reports/:path*','/settings/:path*']};
