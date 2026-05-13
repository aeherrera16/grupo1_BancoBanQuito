import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { DashboardPage } from './pages/DashboardPage';
import { PagosMasivosPage } from './pages/PagosMasivosPage';
import { LayoutEmpresas } from './components/LayoutEmpresas';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />

          {/* Protected Banca Empresas routes */}
          <Route
            path="/dashboard"
            element={
              <LayoutEmpresas>
                <DashboardPage />
              </LayoutEmpresas>
            }
          />
          <Route
            path="/pagos-masivos"
            element={
              <LayoutEmpresas>
                <PagosMasivosPage />
              </LayoutEmpresas>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
