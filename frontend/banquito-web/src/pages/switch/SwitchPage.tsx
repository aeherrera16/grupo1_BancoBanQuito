import { useEffect, useState } from 'react';
import { DatabaseZap, FileCheck2, ReceiptText, Server, ShieldCheck } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardHeader } from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import StatCard from '../../components/ui/StatCard';
import { BatchesTable } from '../../components/Tables';
import { switchApi } from '../../api/switchApi';
import { readError } from '../../utils/format';

export default function SwitchPage({activeSection='lotes',onNavigate}:{activeSection?:string;onNavigate?:(key:string)=>void}){
 const [batches,setBatches]=useState<any[]>([]); const [health,setHealth]=useState<any>(null); const [error,setError]=useState(''); const [file,setFile]=useState<File|null>(null); const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(false);
 const load=async()=>{try{setHealth(await switchApi.health()); setBatches(await switchApi.batches())}catch(e){setError(readError(e))}}; useEffect(()=>{load()},[]);
 async function validate(){if(!file)return; setLoading(true); setError(''); setResult(null); try{const r=await switchApi.uploadCsv(file,'PORTAL'); setResult(r); await load()}catch(e){setError(readError(e))}finally{setLoading(false)}}
 const processed=batches.filter(b=>String(b.status).toUpperCase().includes('PROCESS')||String(b.status).toUpperCase().includes('PROCES')).length;
 return <Layout activeKey={activeSection} onNavigate={onNavigate}>
  <div className="mb-6"><h2 className="text-2xl font-extrabold text-slate-950">Centro de Operación Switch</h2><p className="text-sm text-slate-500">Validación RF-02, recepción de lotes y monitoreo del servicio.</p></div>
  {error&&<div className="mb-5"><Alert type="error">{error}</Alert></div>}
  <div className="grid gap-4 md:grid-cols-4"><StatCard title="Servicio Switch" value={health?.status||'DOWN'} detail="/api/switch/health" icon={Server}/><StatCard title="Lotes" value={String(batches.length)} detail="Recibidos/consultados" icon={FileCheck2}/><StatCard title="Procesados" value={String(processed)} detail="Estado final" icon={DatabaseZap}/><StatCard title="Validación" value="RF-02" detail="Hash, RUC y totales" icon={ShieldCheck}/></div>
  {activeSection==='lotes'&&<div className="mt-6"><Card><CardHeader title="Lotes recibidos" subtitle="Listado funcional del Switch"/><div className="p-5"><BatchesTable batches={batches}/></div></Card></div>}
  {activeSection==='validar'&&<div className="mt-6 max-w-3xl"><Card><CardHeader title="Validar archivo" subtitle="Carga manual al endpoint real del Switch"/><div className="space-y-4 p-5"><input type="file" accept=".csv,.txt" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full rounded-2xl border bg-white p-3 text-sm"/><button onClick={validate} disabled={!file||loading} className="rounded-2xl bg-[#0B1F3A] px-5 py-3 font-bold text-white disabled:opacity-50">{loading?'Validando...':'Validar en Switch'}</button>{result&&<Alert type={result.isSuccess?'success':'info'}><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result,null,2)}</pre></Alert>}</div></Card></div>}
  {activeSection==='pagos'&&<div className="mt-6"><Card><CardHeader title="Pagos por lote" subtitle="Detalle preparado para endpoint de pagos"/><div className="p-5 text-sm text-slate-600">Cuando el backend exponga el detalle por lote, aquí se mostrará línea, beneficiario, cuenta destino, monto, estado y causal de rechazo.</div></Card></div>}
  {activeSection==='com'&&<div className="mt-6"><Card><CardHeader title="Comisiones" subtitle="Resumen de tarifaje e IVA"/><div className="p-5"><div className="grid gap-4 md:grid-cols-3"><StatCard title="Tarifa" value="$0.40" detail="Ejemplo 11 a 100 exitosas" icon={ReceiptText}/><StatCard title="IVA" value="15%" detail="Sobre subtotal" icon={ReceiptText}/><StatCard title="Cobro" value="Automático" detail="Core contable" icon={DatabaseZap}/></div></div></Card></div>}
  <div className="mt-6"><Card><CardHeader title="Health del servicio" subtitle="Respuesta técnica del Switch"/><div className="p-5"><pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-50">{JSON.stringify(health,null,2)}</pre></div></Card></div>
 </Layout>
}
