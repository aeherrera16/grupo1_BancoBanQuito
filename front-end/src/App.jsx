import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { DashboardPage } from './pages/DashboardPage';
import { PagosMasivosPage } from './pages/PagosMasivosPage';
import { LayoutEmpresas } from './components/LayoutEmpresas';
import './index.css';

function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a365d, #2c5aa0)',
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '1rem' }}>En Construcción</h1>
        <p style={{ fontSize: '18px', marginBottom: '2rem' }}>Esta sección estará disponible próximamente</p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '12px 32px',
          backgroundColor: '#d4a574',
          color: '#1a365d',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
        }}>
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

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

          {/* Banca Personal */}
          <Route path="/personal" element={<ComingSoon />} />

          {/* Intranet Asesores */}
          <Route path="/asesores" element={<ComingSoon />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
