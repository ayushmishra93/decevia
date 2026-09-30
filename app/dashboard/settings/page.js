import { requireUser } from '@/lib/auth';
import Workspace from '@/components/platform/workspace';
export default async function Page() { await requireUser(); return <Workspace view="settings"/>; }
