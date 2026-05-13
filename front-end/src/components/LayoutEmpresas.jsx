import { Navigate } from 'react-router-dom';
import { portals } from '../config/portals';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

export function LayoutEmpresas({ children, allowedPortal }) {
  const { isAuthenticated, portal, logout, user } = useAuth();
  const portalInfo = portals[portal];

  if (!isAuthenticated || portal !== allowedPortal) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#eef2f6]">
      <Sidebar logout={logout} portal={portal} user={user} />
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-banker-gold">{portalInfo?.label}</p>
              <p className="mt-1 text-sm text-slate-500">Operación segura BancoBanQuito</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black uppercase text-banker-navy">{user?.name}</p>
              <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </header>
        <main className="overflow-auto">{children}</main>
      </section>
    </div>
  );
}
