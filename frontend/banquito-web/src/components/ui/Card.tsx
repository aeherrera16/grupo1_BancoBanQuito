import React from 'react';
export function Card({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>}
export function CardHeader({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){return <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5"><div><h3 className="font-bold text-slate-950">{title}</h3>{subtitle&&<p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>}
