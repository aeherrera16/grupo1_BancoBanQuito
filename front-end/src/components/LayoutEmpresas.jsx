import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';

export function LayoutEmpresas({ children }) {
  const { isAuthenticated, portal, logout } = useAuth();

  if (!isAuthenticated || portal !== 'empresa') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-banker-light">
      <Sidebar logout={logout} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
