import { useState } from 'react';
import { AuthContext } from './authContextObject';

const portalUsers = {
  asesor: {
    id: '2001',
    name: 'Asesor de Sucursal',
    email: 'asesor.sucursal@banquito.ec',
    role: 'ASESOR_SUCURSAL',
    coreUserId: 2001,
  },
  bancaPersonas: {
    id: '2101',
    name: 'Banca de Personas',
    email: 'banca.personas@banquito.ec',
    role: 'BANCA_PERSONAS',
    coreUserId: 2101,
  },
  personaNatural: {
    id: '1001',
    name: 'Cliente Persona Natural',
    email: 'cliente.natural@correo.ec',
    role: 'PERSONA_NATURAL',
  },
  cajero: {
    id: '2201',
    name: 'Cajero de Ventanilla',
    email: 'cajero@banquito.ec',
    role: 'CAJERO',
    coreUserId: 2201,
  },
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    portal: null,
    user: null,
  });

  const login = (portal) => {
    setAuth({
      isAuthenticated: true,
      portal,
      user: portalUsers[portal],
    });
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      portal: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
