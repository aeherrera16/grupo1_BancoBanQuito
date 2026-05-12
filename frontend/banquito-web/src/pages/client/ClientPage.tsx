import { useEffect, useState } from 'react';
import { BadgeDollarSign, ReceiptText, WalletCards } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Card, CardHeader } from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import StatCard from '../../components/ui/StatCard';
import { AccountsTable } from '../../components/Tables';
import { coreApi } from '../../api/coreApi';
import { money, readError, uuid } from '../../utils/format';

const input='w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#123B66] focus:ring-4 focus:ring-blue-100';
function Field({label,children}:{label:string;children:any}){return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-2">{children}</div></label>}

export default function ClientPage({activeSection='home',onNavigate}:{activeSection?:string;onNavigate?:(key:string)=>void}){
 const [accounts,setAccounts]=useState<any[]>([]); const [transactions,setTransactions]=useState<any[]>([]); const [error,setError]=useState(''); const [msg,setMsg]=useState('');
 const [transfer,setTransfer]=useState({sourceAccountNumber:'',targetAccountNumber:'',amount:0,description:'Transferencia banca web'});
 const load=async()=>{try{const [a,t]=await Promise.all([coreApi.accounts(),coreApi.transactions()]); setAccounts(a); setTransactions(t)}catch(e){setError(readError(e))}}; useEffect(()=>{load()},[]);
 const total=accounts.reduce((s,a)=>s+Number(a.availableBalance??a.balance??0),0);
 async function sendTransfer(){setMsg('');setError('');try{await coreApi.transfer({...transfer,amount:Number(transfer.amount),transactionUuid:uuid()}); setMsg('Transferencia enviada al Core.'); await load()}catch(e){setError(readError(e))}}
 return <Layout activeKey={activeSection} onNavigate={onNavigate}>
  <div className="mb-6"><h2 className="text-2xl font-extrabold text-slate-950">Banca Web Personas</h2><p className="text-sm text-slate-500">Consulta de cuentas, movimientos y transferencia simple.</p></div>
  {msg&&<div className="mb-5"><Alert type="success">{msg}</Alert></div>}{error&&<div className="mb-5"><Alert type="error">{error}</Alert></div>}
  <div className="grid gap-4 md:grid-cols-3"><StatCard title="Mis cuentas" value={String(accounts.length)} detail="Productos activos" icon={WalletCards}/><StatCard title="Disponible" value={money(total)} detail="Saldo total" icon={BadgeDollarSign}/><StatCard title="Movimientos" value={String(transactions.length)} detail="Últimos registros" icon={ReceiptText}/></div>
  {activeSection==='home'&&<div className="mt-6"><Card><CardHeader title="Mis cuentas" subtitle="Saldos consultados al Core"/><div className="p-5"><AccountsTable accounts={accounts}/></div></Card></div>}
  {activeSection==='mov'&&<div className="mt-6"><Card><CardHeader title="Movimientos" subtitle="Historial conectado al Core cuando exista el endpoint"/><div className="overflow-auto p-5"><pre className="rounded-2xl bg-slate-950 p-4 text-xs text-white">{JSON.stringify(transactions,null,2)}</pre></div></Card></div>}
  {activeSection==='trans'&&<div className="mt-6 max-w-3xl"><Card><CardHeader title="Transferencia" subtitle="Genera UUID limpio para idempotencia"/><div className="grid gap-4 p-5"><Field label="Cuenta origen"><input className={input} value={transfer.sourceAccountNumber} onChange={e=>setTransfer({...transfer,sourceAccountNumber:e.target.value})}/></Field><Field label="Cuenta destino"><input className={input} value={transfer.targetAccountNumber} onChange={e=>setTransfer({...transfer,targetAccountNumber:e.target.value})}/></Field><Field label="Monto"><input type="number" className={input} value={transfer.amount} onChange={e=>setTransfer({...transfer,amount:Number(e.target.value)})}/></Field><Field label="Descripción"><input className={input} value={transfer.description} onChange={e=>setTransfer({...transfer,description:e.target.value})}/></Field><button onClick={sendTransfer} className="rounded-2xl bg-[#0B1F3A] px-5 py-3 font-bold text-white">Enviar transferencia</button></div></Card></div>}
 </Layout>
}
