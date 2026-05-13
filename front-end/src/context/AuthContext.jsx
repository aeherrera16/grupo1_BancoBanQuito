import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    portal: null,
    user: null,
    coreUserId: null,
    testData: null,
  });

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const response = await fetch('http://localhost:8080/core/v1/auth/test-data');
        if (response.ok) {
          const data = await response.json();
          setAuth(prev => ({
            ...prev,
            testData: data,
            coreUserId: data.coreUserId,
          }));
        }
      } catch (error) {
        console.error('Error loading test data:', error);
      }
    };

    loadTestData();
  }, []);

  const login = (portal) => {
    let selectedUser = null;

    if (auth.testData && auth.testData.customers.length > 0) {
      selectedUser = auth.testData.customers[0];
    }

    setAuth(prev => ({
      ...prev,
      isAuthenticated: true,
      portal,
      user: selectedUser || {
        id: '1',
        name: 'Usuario Corporativo',
        email: 'user@empresa.ec',
      },
    }));
  };

  const logout = () => {
    setAuth(prev => ({
      ...prev,
      isAuthenticated: false,
      portal: null,
      user: null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
