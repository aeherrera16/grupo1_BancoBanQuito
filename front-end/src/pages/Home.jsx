import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePortalSelect = (portal) => {
    login(portal);
    if (portal === 'empresa') {
      navigate('/dashboard');
    } else if (portal === 'personal') {
      navigate('/personal');
    } else if (portal === 'asesores') {
      navigate('/asesores');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a365d, #2c5aa0, #2d3748)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '1280px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#d4a574',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
            }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a365d' }}>₡</span>
            </div>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>BancoBanQuito</h1>
          <p style={{ color: '#f8f9fa', fontSize: '20px' }}>Soluciones financieras confiables para tu negocio</p>
        </div>

        {/* Portal Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
        }}>
          {/* Banca Empresas */}
          <div
            onClick={() => handlePortalSelect('empresa')}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 40px rgba(212, 165, 116, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #2c5aa0, #1a365d)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a365d', marginBottom: '1rem', textAlign: 'center' }}>
              Banca Empresas
            </h3>
            <p style={{ color: '#718096', textAlign: 'center', marginBottom: '2rem', fontSize: '14px', lineHeight: '1.6' }}>
              Gestiona pagos masivos, consulta tus cuentas y administra tu liquidez empresarial de forma segura.
            </p>
            <button style={{
              width: '100%',
              background: 'linear-gradient(90deg, #2c5aa0, #1a365d)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Acceder
            </button>
          </div>

          {/* Banca Personal */}
          <div
            onClick={() => handlePortalSelect('personal')}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 40px rgba(212, 165, 116, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #2c5aa0, #1a365d)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a365d', marginBottom: '1rem', textAlign: 'center' }}>
              Banca Personal
            </h3>
            <p style={{ color: '#718096', textAlign: 'center', marginBottom: '2rem', fontSize: '14px', lineHeight: '1.6' }}>
              Accede a tus cuentas, realiza transferencias y gestiona tus finanzas personales.
            </p>
            <button style={{
              width: '100%',
              background: 'linear-gradient(90deg, #2c5aa0, #1a365d)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Acceder
            </button>
          </div>

          {/* Intranet Asesores */}
          <div
            onClick={() => handlePortalSelect('asesores')}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              cursor: 'pointer',
              boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 40px rgba(212, 165, 116, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 25px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #2c5aa0, #1a365d)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a365d', marginBottom: '1rem', textAlign: 'center' }}>
              Intranet Asesores
            </h3>
            <p style={{ color: '#718096', textAlign: 'center', marginBottom: '2rem', fontSize: '14px', lineHeight: '1.6' }}>
              Herramientas y recursos para asesores financieros del banco.
            </p>
            <button style={{
              width: '100%',
              background: 'linear-gradient(90deg, #2c5aa0, #1a365d)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Acceder
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          color: '#f8f9fa',
        }}>
          <p style={{ fontSize: '14px' }}>© 2026 BancoBanQuito. Todos los derechos reservados.</p>
          <p style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.75 }}>Seguridad · Privacidad · Términos de Servicio</p>
        </div>
      </div>
    </div>
  );
}
