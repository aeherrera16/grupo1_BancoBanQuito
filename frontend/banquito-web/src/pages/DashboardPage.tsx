import { useEffect, useState } from 'react';
import { Activity, FileCheck2, Users, WalletCards } from 'lucide-react';
import Layout, { menus } from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { AccountsTable, BatchesTable, CustomersTable } from '../components/Tables';
import { coreApi } from '../api/coreApi';
import { switchApi } from '../api/switchApi';
import { money, readError } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import CompanyUploadPage from './company/CompanyUploadPage';
import StaffPage from './staff/StaffPage';
import SwitchPage from './switch/SwitchPage';
import ClientPage from './client/ClientPage';

export default function DashboardPage(){
 const {session}=useAuth();
 const role=session?.role || 'ADMIN';
 const defaultKey = menus[role]?.[0]?.key || 'resumen';
 const [active,setActive]=useState(defaultKey);
 useEffect(()=>setActive(defaultKey),[role, defaultKey]);

 if(role==='EMPRESA') return <CompanyUploadPage activeSection={active} onNavigate={setActive}/>;
 if(role==='ASESOR'||role==='CAJERO') return <StaffPage activeSection={active} onNavigate={setActive}/>;
 if(role==='SWITCH') return <SwitchPage activeSection={active} onNavigate={setActive}/>;
 if(role==='CLIENTE_NATURAL') return <ClientPage activeSection={active} onNavigate={setActive}/>;

 return <AdminDashboard activeSection={active} onNavigate={setActive}/>;
}

function AdminDashboard({activeSection,onNavigate}:{activeSection:string;onNavigate:(key:string)=>void}){
 const [customers,setCustomers]=useState<any[]>([]); const [accounts,setAccounts]=useState<any[]>([]); const [batches,setBatches]=useState<any[]>([]); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{try{const [c,a,b]=await Promise.all([coreApi.customers(),coreApi.accounts(),switchApi.batches()]);setCustomers(c);setAccounts(a);setBatches(b)}catch(e){setError(readError(e))}})()},[]);
 const totalBalance=accounts.reduce((s,a)=>s+Number(a.availableBalance??a.balance??0),0);
 return <Layout activeKey={activeSection} onNavigate={onNavigate}>
  <div className="mb-6"><h2 className="text-2xl font-extrabold text-slate-950">Administración General</h2><p className="text-sm text-slate-500">Vista consolidada de clientes, cuentas, transacciones y lotes.</p></div>
  {error&&<div className="mb-5"><Alert type="error">{error}</Alert></div>}
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="Clientes" value={String(customers.length)} detail="Naturales y jurídicos" icon={Users}/><StatCard title="Cuentas" value={String(accounts.length)} detail="Productos pasivos" icon={WalletCards}/><StatCard title="Saldo disponible" value={money(totalBalance)} detail="Cuentas cargadas" icon={Activity}/><StatCard title="Lotes Switch" value={String(batches.length)} detail="Pagos masivos" icon={FileCheck2}/></div>
  {(activeSection==='resumen'||activeSection==='core')&&<div className="mt-6 grid gap-6 xl:grid-cols-2"><Card><CardHeader title="Cuentas" subtitle="Consulta funcional hacia endpoints del Core"/><div className="p-5"><AccountsTable accounts={accounts}/></div></Card><Card><CardHeader title="Clientes" subtitle="Personas naturales y empresas"/><div className="p-5"><CustomersTable customers={customers}/></div></Card></div>}
  {(activeSection==='resumen'||activeSection==='switch')&&<div className="mt-6"><Card><CardHeader title="Lotes de pago" subtitle="Switch de Pagos Masivos"/><div className="p-5"><BatchesTable batches={batches}/></div></Card></div>}
  {activeSection==='usuarios'&&<div className="mt-6"><Card><CardHeader title="Usuarios del sistema" subtitle="Roles simulados para navegación del frontend"/><div className="p-5 text-sm text-slate-600">Módulo preparado para autenticación real cuando el backend exponga usuarios y roles.</div></Card></div>}
 </Layout>
}
