export const portals = {
  asesor: {
    label: 'Asesor de sucursal',
    description: 'Alta y consulta operativa de clientes, cuentas y credenciales web.',
    startPath: '/asesor',
    accent: 'bg-banker-blue',
    permissions: [
      'Consultar cliente por identificación',
      'Crear persona natural o jurídica',
      'Abrir cuenta con usuario Core',
      'Crear credencial web para clientes',
      'Consultar catálogo de sucursales',
    ],
  },
  bancaPersonas: {
    label: 'Banca de personas',
    description: 'Administración limitada de cuentas de personas naturales y seguimiento del Switch.',
    startPath: '/banca-personas',
    accent: 'bg-banker-navy',
    permissions: [
      'Consultar clientes y cuentas',
      'Bloquear, suspender o inactivar cuentas',
      'Revisar lotes de pagos masivos',
      'Supervisar buzón SFTP de empresas',
    ],
  },
  personaNatural: {
    label: 'Persona natural',
    description: 'Portal del cliente para revisar sus cuentas y enviar transferencias.',
    startPath: '/persona-natural',
    accent: 'bg-banker-gold',
    permissions: [
      'Ingreso por credencial web de cliente',
      'Consulta de cuenta propia',
      'Transferencias desde cuenta propia',
    ],
  },
  cajero: {
    label: 'Cajero',
    description: 'Operación de ventanilla con depósitos, retiros y transferencias.',
    startPath: '/cajero',
    accent: 'bg-slate-700',
    permissions: [
      'Consultar cuenta por número',
      'Registrar crédito de depósito',
      'Registrar débito de retiro',
      'Registrar transferencia de ventanilla',
    ],
  },
};

export const menuByPortal = {
  asesor: [
    { path: '/asesor', label: 'Clientes y cuentas' },
    { path: '/asesor/credenciales', label: 'Credenciales web' },
  ],
  bancaPersonas: [
    { path: '/banca-personas', label: 'Cuentas' },
    { path: '/banca-personas/pagos-masivos', label: 'Pagos masivos' },
    { path: '/banca-personas/sftp', label: 'Buzón SFTP' },
  ],
  personaNatural: [
    { path: '/persona-natural', label: 'Mis cuentas' },
    { path: '/persona-natural/transferencias', label: 'Transferencias' },
  ],
  cajero: [
    { path: '/cajero', label: 'Ventanilla' },
    { path: '/cajero/consulta', label: 'Consulta cuenta' },
  ],
};
