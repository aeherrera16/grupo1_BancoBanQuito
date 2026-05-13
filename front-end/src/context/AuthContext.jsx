import { useState, useEffect } from 'react';
import { AuthContext } from './authContextObject';

const staffPortals = new Set(['operador', 'cajero']);
const STORAGE_KEY = 'banquito_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    portal: null,
    user: null,
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (e) {
        console.error('Error al restaurar sesión:', e);
      }
    }
  }, []);

  const login = (portal, name, identificacion = '', identificationType = 'CEDULA') => {
    const isStaff = staffPortals.has(portal);

    const user = isStaff
      ? {
          name,
          role: 'STAFF',
        }
      : {
          name,
          identificacion,
          identificationType,
          role: 'CUSTOMER',
        };

    const newAuth = {
      isAuthenticated: true,
      portal,
      user,
    };

    setAuth(newAuth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));

    return user;
  };

  const logout = () => {
    const newAuth = {
      isAuthenticated: false,
      portal: null,
      user: null,
    };

    setAuth(newAuth);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
