import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { AccountOperationsPage } from './pages/AccountOperationsPage';
import { CashierPage } from './pages/CashierPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { CustomerAccountsPage } from './pages/CustomerAccountsPage';
import { CustomerOnboardingPage } from './pages/CustomerOnboardingPage';
import { CustomerTransferPage } from './pages/CustomerTransferPage';
import { PagosMasivosPage } from './pages/PagosMasivosPage';
import { SftpMailboxPage } from './pages/SftpMailboxPage';
import { LayoutEmpresas } from './components/LayoutEmpresas';
import './index.css';

function Protected({ portal, children }) {
  return <LayoutEmpresas allowedPortal={portal}>{children}</LayoutEmpresas>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/asesor"
            element={
              <Protected portal="asesor">
                <CustomerOnboardingPage />
              </Protected>
            }
          />
          <Route
            path="/asesor/credenciales"
            element={
              <Protected portal="asesor">
                <CredentialsPage />
              </Protected>
            }
          />
          <Route
            path="/banca-personas"
            element={
              <Protected portal="bancaPersonas">
                <AccountOperationsPage />
              </Protected>
            }
          />
          <Route
            path="/banca-personas/pagos-masivos"
            element={
              <Protected portal="bancaPersonas">
                <PagosMasivosPage />
              </Protected>
            }
          />
          <Route
            path="/banca-personas/sftp"
            element={
              <Protected portal="bancaPersonas">
                <SftpMailboxPage />
              </Protected>
            }
          />
          <Route
            path="/persona-natural"
            element={
              <Protected portal="personaNatural">
                <CustomerAccountsPage />
              </Protected>
            }
          />
          <Route
            path="/persona-natural/transferencias"
            element={
              <Protected portal="personaNatural">
                <CustomerTransferPage />
              </Protected>
            }
          />
          <Route
            path="/cajero"
            element={
              <Protected portal="cajero">
                <CashierPage />
              </Protected>
            }
          />
          <Route
            path="/cajero/consulta"
            element={
              <Protected portal="cajero">
                <CustomerAccountsPage cashierMode />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
