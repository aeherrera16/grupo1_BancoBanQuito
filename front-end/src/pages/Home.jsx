import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePortalSelect = (portal) => {
    login(portal);
    if (portal === 'empresa') {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banker-navy via-banker-blue to-banker-dark flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-8 animate-pulse">
            <div className="w-20 h-20 bg-banker-gold rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-bold text-banker-navy">₡</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">BancoBanQuito</h1>
          <p className="text-banker-light text-xl md:text-2xl">Soluciones financieras confiables para tu negocio</p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Banca Empresas */}
          <div
            onClick={() => handlePortalSelect('empresa')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-banker-gold/70 hover:-translate-y-2 group"
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-banker-blue to-banker-navy rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-banker-navy mb-4 text-center">
              Banca Empresas
            </h3>
            <p className="text-banker-gray text-center mb-8 text-sm leading-relaxed">
              Gestiona pagos masivos, consulta tus cuentas y administra tu liquidez empresarial de forma segura.
            </p>
            <button className="w-full bg-gradient-to-r from-banker-blue to-banker-navy text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Acceder
            </button>
          </div>

          {/* Banca Personal */}
          <div
            onClick={() => handlePortalSelect('personal')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-banker-gold/70 hover:-translate-y-2 group"
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-banker-blue to-banker-navy rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-banker-navy mb-4 text-center">
              Banca Personal
            </h3>
            <p className="text-banker-gray text-center mb-8 text-sm leading-relaxed">
              Accede a tus cuentas, realiza transferencias y gestiona tus finanzas personales.
            </p>
            <button className="w-full bg-gradient-to-r from-banker-blue to-banker-navy text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Acceder
            </button>
          </div>

          {/* Intranet Asesores */}
          <div
            onClick={() => handlePortalSelect('asesores')}
            className="bg-white rounded-2xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-banker-gold/70 hover:-translate-y-2 group"
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-banker-blue to-banker-navy rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-banker-navy mb-4 text-center">
              Intranet Asesores
            </h3>
            <p className="text-banker-gray text-center mb-8 text-sm leading-relaxed">
              Herramientas y recursos para asesores financieros del banco.
            </p>
            <button className="w-full bg-gradient-to-r from-banker-blue to-banker-navy text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Acceder
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-banker-light">
          <p className="text-sm">© 2026 BancoBanQuito. Todos los derechos reservados.</p>
          <p className="text-xs mt-2 opacity-75">Seguridad · Privacidad · Términos de Servicio</p>
        </div>
      </div>
    </div>
  );
}
