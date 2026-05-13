import { useState } from 'react';
import { authCoreUser, authCustomer } from '../services/apiClient';
import { AuthContext } from './authContextObject';

const staffPortals = new Set(['operador', 'cajero']);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    portal: null,
    user: null,
  });

  const login = async (portal, username, password) => {
    const isStaff = staffPortals.has(portal);
    const response = isStaff
      ? await authCoreUser(username, password)
      : await authCustomer(username, password);

    const user = isStaff
      ? {
          id: String(response.coreUserId),
          name: response.fullName,
          email: response.username,
          role: response.role,
          coreUserId: response.coreUserId,
          lastLogin: response.lastLogin,
        }
      : {
          id: String(response.customerId),
          name: response.customerName,
          email: response.username,
          role: 'CUSTOMER',
          customerId: response.customerId,
          lastLogin: response.lastLogin,
        };

    setAuth({
      isAuthenticated: true,
      portal,
      user,
    });

    return user;
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
