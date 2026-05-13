import { Link, useLocation, useNavigate } from 'react-router-dom';
import { menuByPortal, portals } from '../config/portals';

export default function Sidebar({ logout, portal, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const menu = menuByPortal[portal] || [];
  const portalInfo = portals[portal];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white text-banker-dark">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-banker-navy">
            <span className="text-sm font-black text-white">BQ</span>
          </div>
          <div>
            <span className="block text-lg font-black text-banker-navy">BancoBanQuito</span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-banker-gray">En línea</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 p-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef5f7] text-xl font-black text-banker-blue">
          {user?.name?.slice(0, 1)}
        </div>
        <p className="text-center text-sm font-black text-banker-navy">{user?.name}</p>
        <p className="mt-1 text-center text-xs text-slate-500">{portalInfo?.label}</p>
      </div>

      <nav className="flex-1 overflow-auto p-5">
        <p className="mb-3 px-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Menú</p>
        <div className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block border-l-4 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? 'border-banker-gold bg-[#f5f8fa] text-banker-navy'
                  : 'border-transparent text-slate-600 hover:border-banker-blue/40 hover:bg-[#f8fbfc] hover:text-banker-navy'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm font-black text-banker-navy transition-colors hover:bg-slate-50"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}
