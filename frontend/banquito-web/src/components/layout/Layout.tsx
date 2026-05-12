import { Activity, BadgeDollarSign, Banknote, Bell, BriefcaseBusiness, Building2, CreditCard, DatabaseZap, FileCheck2, Landmark, LogOut, ReceiptText, Search, ShieldCheck, UploadCloud, UserRound, Users, WalletCards } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

const roleLabel:Record<Role,string>={CLIENTE_NATURAL:'Cliente Natural',EMPRESA:'Empresa / Persona Jurídica',ASESOR:'Asesor de Agencia',CAJERO:'Cajero',SWITCH:'Operador Switch',ADMIN:'Administrador'};
const menus:Record<Role,{key:string;label:string;icon:any}[]>={
 CLIENTE_NATURAL:[{key:'home',label:'Mis cuentas',icon:WalletCards},{key:'mov',label:'Movimientos',icon:ReceiptText},{key:'trans',label:'Transferencias',icon:BadgeDollarSign}],
 EMPRESA:[{key:'empresa',label:'Dashboard empresa',icon:Building2},{key:'upload',label:'Carga CSV',icon:UploadCloud},{key:'lotes',label:'Lotes y reportes',icon:FileCheck2},{key:'cuentas',label:'Cuentas',icon:WalletCards}],
 ASESOR:[{key:'clientes',label:'Clientes',icon:Users},{key:'natural',label:'Crear natural',icon:UserRound},{key:'empresa',label:'Crear empresa',icon:BriefcaseBusiness},{key:'cuentas',label:'Abrir cuentas',icon:CreditCard}],
 CAJERO:[{key:'buscar',label:'Buscar cuenta',icon:Search},{key:'deposito',label:'Depósitos',icon:BadgeDollarSign},{key:'retiro',label:'Retiros',icon:Banknote},{key:'mov',label:'Movimientos',icon:ReceiptText}],
 SWITCH:[{key:'lotes',label:'Lotes recibidos',icon:FileCheck2},{key:'validar',label:'Validaciones',icon:ShieldCheck},{key:'pagos',label:'Pagos',icon:BadgeDollarSign},{key:'com',label:'Comisiones',icon:ReceiptText}],
 ADMIN:[{key:'resumen',label:'Resumen general',icon:Activity},{key:'core',label:'Core',icon:Landmark},{key:'switch',label:'Switch',icon:DatabaseZap},{key:'usuarios',label:'Usuarios',icon:Users}],
};

type LayoutProps = {
  children:any;
  activeKey?: string;
  onNavigate?: (key:string)=>void;
};

export default function Layout({children, activeKey, onNavigate}:LayoutProps){
 const {session,logout}=useAuth();
 const role=session?.role||'ADMIN';
 const menu = menus[role];
 const active = activeKey || menu[0]?.key;
 return <div className="min-h-screen bg-slate-100">
  <div className="flex">
   <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white p-5 lg:block">
    <div className="flex items-center gap-3 rounded-2xl bg-[#0B1F3A] p-4 text-white">
     <Landmark/><div><p className="text-sm font-extrabold">Banco BanQuito</p><p className="text-xs text-slate-300">Core + Switch</p></div>
    </div>
    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
     <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Perfil activo</p>
     <p className="mt-1 text-sm font-bold text-slate-900">{roleLabel[role]}</p>
    </div>
    <nav className="mt-6 space-y-2">
     {menu.map((m)=><button key={m.key} onClick={()=>onNavigate?.(m.key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${active===m.key?'bg-[#123B66] text-white shadow':'text-slate-600 hover:bg-slate-100'}`}><m.icon size={19}/>{m.label}</button>)}
    </nav>
    <button onClick={logout} className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut size={19}/>Cerrar sesión</button>
   </aside>
   <main className="min-w-0 flex-1">
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
     <div><h1 className="text-xl font-extrabold text-slate-950">{roleLabel[role]}</h1><p className="text-sm text-slate-500">{session?.displayName} · Frontend funcional BanQuito</p></div>
     <div className="flex items-center gap-3"><button className="rounded-2xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"><Bell size={20}/></button><span className="rounded-2xl bg-[#D4AF37]/15 px-4 py-3 text-sm font-extrabold text-[#8A6A00]">V1</span></div>
    </header>
    <div className="p-5 lg:p-8">{children}</div>
   </main>
  </div>
 </div>
}
export { roleLabel, menus };
