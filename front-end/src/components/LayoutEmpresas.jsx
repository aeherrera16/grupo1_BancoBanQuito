import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { portals } from '../config/portals';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

export function LayoutEmpresas({ children, allowedPortal }) {
  const { isAuthenticated, portal, logout, user } = useAuth();
  const portalInfo = portals[portal];
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || portal !== allowedPortal) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <Sidebar logout={logout} portal={portal} user={user} />
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
          <div className="flex min-h-20 items-center justify-between px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-banker-gold">{portalInfo?.label}</p>
              <p className="mt-1 text-sm text-slate-500">Operación segura BancoBanQuito</p>
            </div>
            <div className="flex items-center text-right gap-4">
              <div className="text-right flex flex-col justify-center">
                <p className="text-xl font-medium uppercase text-[#006644]">{user?.name || "USUARIO BANQUITO"}</p>
                {user?.identificacion && (
                  <p className="mt-0.5 text-[13px] font-medium text-gray-500">{user.identificacion}</p>
                )}
              </div>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-[#006644] transition-colors focus:outline-none flex-shrink-0 bg-gray-100 flex items-center justify-center"
              >
                {portal === 'empresa' ? (
                  <svg className="w-full h-full text-white p-2.5 bg-[#006644]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
                ) : (
                  <svg className="w-full h-full text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="overflow-auto">{children}</main>
      </section>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProfileOpen(false)}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8e8e8] shadow-2xl" style={{ borderBottomLeftRadius: '100%' }}>
            <div className="absolute top-4 right-4 flex flex-col gap-3 items-center">
               <button onClick={() => setIsProfileOpen(false)} className="p-1 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
               </button>
               <button onClick={handleLogout} className="p-1 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none" title="Cerrar sesión">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                   <polyline points="16 17 21 12 16 7" />
                   <line x1="21" y1="12" x2="9" y2="12" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
