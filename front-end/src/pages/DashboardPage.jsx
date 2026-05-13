import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-banker-navy mb-2">
          Dashboard
        </h1>
        <p className="text-banker-gray mb-8">
          Bienvenido, {user?.name}
        </p>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Saldo Total</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">$45,230.00</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Transacciones Hoy</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Cuentas Activas</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-banker-blue">
            <p className="text-banker-gray text-sm font-semibold">Alertas</p>
            <p className="text-3xl font-bold text-banker-navy mt-2">0</p>
          </div>
        </div>

        {/* Placeholder for future content */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-banker-navy mb-4">Movimientos Recientes</h2>
          <p className="text-banker-gray">Los movimientos se mostrarán aquí cuando tengas datos</p>
        </div>
      </div>
    </div>
  );
}
