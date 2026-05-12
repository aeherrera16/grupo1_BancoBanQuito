import React, { createContext, useContext, useMemo, useState } from 'react';
import { Role, Session } from '../types';
const KEY='banquito_session';
interface AuthCtx { session: Session|null; login:(username:string,role:Role)=>void; logout:()=>void; }
const Ctx=createContext<AuthCtx|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){
 const [session,setSession]=useState<Session|null>(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}});
 const value=useMemo(()=>({session,login:(username:string,role:Role)=>{const s={username,role,displayName:username||role}; localStorage.setItem(KEY,JSON.stringify(s)); setSession(s)},logout:()=>{localStorage.removeItem(KEY); setSession(null)}}),[session]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useAuth=()=>{const v=useContext(Ctx); if(!v) throw new Error('AuthProvider faltante'); return v;}
