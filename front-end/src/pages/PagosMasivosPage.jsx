import { useAuth } from '../hooks/useAuth';

export function PagosMasivosPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-banker-navy mb-2">
          Pagos Masivos
        </h1>
        <p className="text-banker-gray mb-8">
          Gestiona tus pagos masivos de forma eficiente
        </p>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <button className="p-6 border-2 border-dashed border-banker-blue rounded-lg hover:bg-banker-light transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-banker-blue rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-banker-navy">Cargar archivo</h3>
                  <p className="text-sm text-banker-gray">CSV o Excel</p>
                </div>
              </div>
            </button>

            <button className="p-6 border-2 border-dashed border-banker-blue rounded-lg hover:bg-banker-light transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-banker-blue rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3h12a1 1 0 100-2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 6a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-banker-navy">Ver historial</h3>
                  <p className="text-sm text-banker-gray">Pagos procesados</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
