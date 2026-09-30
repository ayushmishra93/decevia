import { requireUser } from '@/lib/auth';
export default async function Layout({children}){await requireUser();return children;}
