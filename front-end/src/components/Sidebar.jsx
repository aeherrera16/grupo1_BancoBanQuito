import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ logout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-banker-navy text-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-banker-blue">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-banker-gold rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-banker-navy">₡</span>
          </div>
          <span className="text-xl font-bold">BancoBanQuito</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-banker-blue text-white'
                : 'text-banker-light hover:bg-banker-blue/20'
            }`}
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Dashboard
            </span>
          </Link>

          <Link
            to="/pagos-masivos"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive('/pagos-masivos')
                ? 'bg-banker-blue text-white'
                : 'text-banker-light hover:bg-banker-blue/20'
            }`}
          >
            <span className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Pagos Masivos
            </span>
          </Link>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-banker-blue">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H3zm0 12a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H3a1 1 0 00-1 1v11z" clipRule="evenodd" />
          </svg>
          Salir
        </button>
      </div>
    </div>
  );
}
