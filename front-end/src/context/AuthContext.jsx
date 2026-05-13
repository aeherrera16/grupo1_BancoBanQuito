import { createContext, useState } from 'react';

export const AuthContext = createContext();

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
      user: {
        id: '1001',
        name: 'Usuario Corporativo',
        email: 'user@empresa.ec',
        role: portal === 'empresa' ? 'ADMIN' : 'USER',
      },
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
