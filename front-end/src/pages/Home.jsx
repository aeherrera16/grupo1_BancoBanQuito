import { useNavigate } from 'react-router-dom';
import { portals } from '../config/portals';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const clientPortals = ['personaNatural', 'bancaPersonas'];
  const staffPortals = ['asesor', 'cajero'];

  const handlePortalSelect = (portal) => {
    login(portal);
    navigate(portals[portal].startPath);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-banker-dark">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-banker-navy text-sm font-black text-white">
              BQ
            </div>
            <div>
              <p className="text-xl font-black tracking-wide text-banker-navy">BancoBanQuito</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-banker-gray">Banca digital</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-semibold text-banker-navy md:flex">
            <span>Seguridad</span>
            <span>Canales</span>
            <span>Ayuda</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1fr_520px] lg:items-center">
        <section className="max-w-2xl">
          <div className="mb-10 inline-flex rounded-full border border-banker-blue/20 bg-white px-4 py-2 text-sm font-semibold text-banker-blue shadow-sm">
            Plataforma transaccional Core + Switch
          </div>
          <h1 className="text-5xl font-black leading-tight text-banker-navy md:text-6xl">
            Accede a tu banca con perfiles operativos claros.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Una experiencia sobria para clientes y personal del banco, con permisos separados según las funciones definidas en Core y Switch.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="border-l-4 border-banker-gold bg-white p-5 shadow-sm">
              <p className="text-2xl font-black text-banker-navy">Core</p>
              <p className="mt-2 text-sm text-slate-600">Clientes, cuentas y movimientos.</p>
            </div>
            <div className="border-l-4 border-banker-blue bg-white p-5 shadow-sm">
              <p className="text-2xl font-black text-banker-navy">Switch</p>
              <p className="mt-2 text-sm text-slate-600">Pagos masivos por lote.</p>
            </div>
            <div className="border-l-4 border-slate-500 bg-white p-5 shadow-sm">
              <p className="text-2xl font-black text-banker-navy">SFTP</p>
              <p className="mt-2 text-sm text-slate-600">Buzón de archivos CSV.</p>
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">
          <div className="mb-8 border-b border-slate-200 pb-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-banker-gold">BancoBanQuito en línea</p>
            <h2 className="mt-3 text-3xl font-black text-banker-navy">Seleccione el acceso</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Los accesos internos usan usuario Core; clientes usan credencial web separada.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Clientes</p>
              <div className="grid gap-3">
                {clientPortals.map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePortalSelect(key)}
                    className="group flex w-full items-center justify-between rounded-sm border border-slate-300 bg-white px-5 py-4 text-left transition hover:border-banker-blue hover:bg-[#f8fbfc]"
                  >
                    <span>
                      <span className="block text-lg font-black text-banker-navy">{portals[key].label}</span>
                      <span className="mt-1 block text-sm text-slate-600">{portals[key].description}</span>
                    </span>
                    <span className="text-2xl font-light text-banker-blue transition group-hover:translate-x-1">›</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Personal Banco</p>
              <div className="grid gap-3">
                {staffPortals.map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePortalSelect(key)}
                    className="group flex w-full items-center justify-between rounded-sm border border-slate-300 bg-white px-5 py-4 text-left transition hover:border-banker-blue hover:bg-[#f8fbfc]"
                  >
                    <span>
                      <span className="block text-lg font-black text-banker-navy">{portals[key].label}</span>
                      <span className="mt-1 block text-sm text-slate-600">{portals[key].description}</span>
                    </span>
                    <span className="text-2xl font-light text-banker-blue transition group-hover:translate-x-1">›</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-sm bg-[#f3f6f8] p-4 text-sm leading-6 text-slate-600">
              Verifica que el acceso corresponda a tu rol. La interfaz muestra únicamente las funciones necesarias para operar.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
