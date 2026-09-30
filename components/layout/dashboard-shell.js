'use client';
import {useEffect,useState} from 'react';
import {Sidebar} from './sidebar';
import {TopNav} from './top-nav';
import {useApi} from '@/components/platform/client';
export function DashboardShell({children}) {
 const [collapsed,setCollapsed]=useState(false),[light,setLight]=useState(false);const health=useApi('/api/dashboard/system-health',false,15000);const settings=useApi('/api/settings',true);
 useEffect(()=>{const apply=()=>{const theme=localStorage.getItem('decevia-theme')||settings.data?.theme||'dark';setLight(theme==='light'||(theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches));};apply();window.addEventListener('decevia-theme',apply);const media=matchMedia('(prefers-color-scheme: light)');media.addEventListener('change',apply);return()=>{window.removeEventListener('decevia-theme',apply);media.removeEventListener('change',apply);};},[settings.data?.theme]);
 return <div className={'dashboard-surface min-h-screen bg-[#070B14] text-slate-100 flex '+(light?'dashboard-light':'')}><Sidebar collapsed={collapsed} setCollapsed={setCollapsed} health={health.data}/><div className={'flex-1 flex flex-col min-w-0 transition-all duration-300 '+(collapsed?'md:pl-20':'md:pl-64')}><TopNav health={health.data}/><main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto cyber-grid">{children}</main></div></div>;
}
