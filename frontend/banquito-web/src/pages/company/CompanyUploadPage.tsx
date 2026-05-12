import { useEffect, useState } from 'react';
import { FileCheck2, UploadCloud, WalletCards } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardHeader } from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import StatCard from '../../components/ui/StatCard';
import { AccountsTable, BatchesTable } from '../../components/Tables';
import { coreApi } from '../../api/coreApi';
import { switchApi } from '../../api/switchApi';
import { money, readError } from '../../utils/format';

function UploadPanel({onUploaded}:{onUploaded:()=>Promise<void>}){
 const [file,setFile]=useState<File|null>(null); const [channel,setChannel]=useState<'PORTAL'|'SFTP'>('PORTAL'); const [result,setResult]=useState<any>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 async function upload(){if(!file)return; setLoading(true); setError(''); setResult(null); try{const r=await switchApi.uploadCsv(file,channel); setResult(r); await onUploaded()}catch(e){setError(readError(e))}finally{setLoading(false)}}
 return <Card><CardHeader title="Carga de archivo CSV" subtitle="Endpoint real: POST /api/payment-batch/upload-csv"/><div className="space-y-4 p-5"><div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><UploadCloud className="mx-auto text-[#123B66]" size={36}/><p className="mt-3 font-bold text-slate-950">Selecciona el archivo de pagos</p><p className="mt-1 text-sm text-slate-500">Acepta .csv o .txt con cabecera, detalle y pie de control.</p><input className="mt-5 w-full rounded-2xl border bg-white p-3 text-sm" type="file" accept=".csv,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/></div><label className="block"><span className="text-sm font-bold text-slate-700">Canal</span><select value={channel} onChange={e=>setChannel(e.target.value as any)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"><option value="PORTAL">Portal Web</option><option value="SFTP">SFTP Seguro</option></select></label><button disabled={!file||loading} onClick={upload} className="w-full rounded-2xl bg-[#0B1F3A] px-5 py-3 font-bold text-white disabled:opacity-50">{loading?'Validando archivo...':'Validar y enviar al Switch'}</button>{error&&<Alert type="error">{error}</Alert>}{result&&<Alert type={result.isSuccess?'success':'info'}><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result,null,2)}</pre></Alert>}</div></Card>
}

export default function CompanyUploadPage({activeSection='empresa',onNavigate}:{activeSection?:string;onNavigate?:(key:string)=>void}){
 const [accounts,setAccounts]=useState<any[]>([]); const [batches,setBatches]=useState<any[]>([]); const [error,setError]=useState('');
 const load=async()=>{try{const [a,b]=await Promise.all([coreApi.accounts(),switchApi.batches()]); setAccounts(a); setBatches(b)}catch(e){setError(readError(e))}};
 useEffect(()=>{load()},[]);
 const total=accounts.reduce((s,a)=>s+Number(a.availableBalance??a.balance??0),0);
 return <Layout activeKey={activeSection} onNavigate={onNavigate}>
  <div className="mb-6"><h2 className="text-2xl font-extrabold text-slate-950">Banca Web Empresas</h2><p className="text-sm text-slate-500">Carga de nómina/proveedores, consulta de cuentas empresariales y seguimiento de lotes.</p></div>
  {error&&<div className="mb-5"><Alert type="error">{error}</Alert></div>}
  <div className="grid gap-4 md:grid-cols-3"><StatCard title="Cuentas empresariales" value={String(accounts.length)} detail="Operativa, nómina e impuestos" icon={WalletCards}/><StatCard title="Disponible" value={money(total)} detail="Saldo consultado al Core" icon={WalletCards}/><StatCard title="Lotes registrados" value={String(batches.length)} detail="Archivos recibidos por Switch" icon={FileCheck2}/></div>
  {activeSection==='empresa'&&<div className="mt-6 grid gap-6 xl:grid-cols-2"><UploadPanel onUploaded={load}/><Card><CardHeader title="Cuentas de la empresa" subtitle="Saldos para cuenta matriz y nómina"/><div className="p-5"><AccountsTable accounts={accounts}/></div></Card></div>}
  {activeSection==='upload'&&<div className="mt-6 max-w-3xl"><UploadPanel onUploaded={load}/></div>}
  {activeSection==='cuentas'&&<div className="mt-6"><Card><CardHeader title="Cuentas de la empresa" subtitle="Saldo contable y disponible"/><div className="p-5"><AccountsTable accounts={accounts}/></div></Card></div>}
  {activeSection==='lotes'&&<div className="mt-6"><Card><CardHeader title="Lotes y reportes" subtitle="Estado de archivos procesados o encolados"/><div className="p-5"><BatchesTable batches={batches}/></div></Card></div>}
 </Layout>
}
