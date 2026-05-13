import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import heroCity from '../assets/banquito.jpg';
import heroTower from '../assets/banquito2.jpg';
import heroGlass from '../assets/banquito3.webp';
import { portals } from '../config/portals';
import { useAuth } from '../hooks/useAuth';

const portalConfig = {
  personaNatural: {
    image: heroCity,
    intro: 'Hola, te damos la bienvenida',
    subtitle: 'Ingresa a tu banca personal en linea.',
  },
  empresa: {
    image: heroTower,
    intro: 'Bienvenido a banca empresas',
    subtitle: 'Gestiona pagos masivos y tesoreria con seguridad.',
  },
  operador: {
    image: heroGlass,
    intro: 'Acceso operativo interno',
    subtitle: 'Gestione clientes, cuentas y credenciales autorizadas.',
  },
  cajero: {
    image: heroCity,
    intro: 'Acceso de ventanilla',
    subtitle: 'Registre movimientos con controles de seguridad.',
  },
};

export function LoginPage() {
  const { portal } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', identificacion: '' });
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useMemo(() => portalConfig[portal], [portal]);
  const portalInfo = portal ? portals[portal] : null;
  const isStaff = portal === 'operador' || portal === 'cajero';
  const isPersonaNatural = portal === 'personaNatural';

  if (!portal || !config || !portalInfo) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    document.title = `${portalInfo.label} | BancoBanQuito`;
  }, [portalInfo.label]);

  const isFormValid = () => {
    if (!form.name.trim()) return false;
    if (!isStaff && !form.identificacion.trim()) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    try {
      if (isStaff) {
        login(portal, form.name);
      } else if (isPersonaNatural) {
        login(portal, form.name, form.identificacion, 'CEDULA');
      } else {
        login(portal, form.name, form.identificacion, 'RUC');
      }
      navigate(portalInfo.startPath);
    } catch (err) {
      setAuthError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-banker-dark">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-sm font-semibold text-slate-700">
          <button className="flex items-center gap-2 text-banker-navy" onClick={() => navigate('/')} type="button">
            <span className="text-lg">←</span>
            Inicio
          </button>
          <div className="flex items-center gap-2 text-base font-black tracking-[0.2em] text-banker-navy">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-banker-gold text-xs text-white">BQ</span>
            BancoBanQuito
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Banca digital</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
            <div className="bg-white p-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-black text-emerald-700">
                  BQ
                </span>
                {portalInfo.label}
              </div>
              <h1 className="mt-4 text-3xl font-black text-banker-navy">{config.intro}</h1>
              <p className="mt-2 text-sm text-slate-600">{config.subtitle}</p>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <label className="text-xs font-semibold text-slate-600">
                  {isStaff ? 'Nombre del empleado' : 'Nombre'}
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-banker-blue"
                    type="text"
                    placeholder={isStaff ? 'Ej: Juan García' : 'Ej: Juan Pérez'}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                {!isStaff && (
                  <label className="text-xs font-semibold text-slate-600">
                    {isPersonaNatural ? 'Número de cédula' : 'RUC'}
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-banker-blue"
                      type="text"
                      placeholder={isPersonaNatural ? 'Ej: 0912345678' : 'Ej: 1791111111001'}
                      value={form.identificacion}
                      onChange={(e) => setForm({ ...form, identificacion: e.target.value })}
                      required
                    />
                  </label>
                )}
              </form>

              {authError ? <p className="mt-3 text-xs text-rose-600">{authError}</p> : null}

              <button
                className="mt-6 w-full rounded-lg bg-banker-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-banker-navy disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSubmitting || !isFormValid()}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                Verifica que estas en el portal oficial antes de ingresar tus datos.
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Acceso seguro para clientes y personal autorizado. Si tienes problemas, contacta al soporte.
              </p>
            </div>

            <div className="relative min-h-[360px] bg-slate-100">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${config.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/35 via-emerald-900/10 to-transparent" />
              <div className="absolute inset-0 bg-white/10" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
