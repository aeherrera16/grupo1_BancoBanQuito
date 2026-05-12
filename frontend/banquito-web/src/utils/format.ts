export const money=(v:any)=>new Intl.NumberFormat('es-EC',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(Number(v??0)||0);
export const dt=(v:any)=>v?new Intl.DateTimeFormat('es-EC',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'-';
export const uuid=()=>crypto.randomUUID();
export const normalizeStatus=(s:any)=>String(s||'').toUpperCase().replace(' ','_');
export const readError=(err:any)=>err?.response?.data?.error||err?.response?.data?.message||err?.message||'No se pudo completar la operación';
