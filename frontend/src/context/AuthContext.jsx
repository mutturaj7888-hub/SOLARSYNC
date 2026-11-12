import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser, registerUser, api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mongoStatus, setMongoStatus] = useState({ connected: false, usersCount: 0 });

  const loadUser = async () => {
    const token = localStorage.getItem('solarsync_token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.warn("Stored session invalid or expired:", e.message);
      localStorage.removeItem('solarsync_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkMongo = async () => {
    try {
      const res = await api.get('/auth/mongodb-status');
      setMongoStatus({
        connected: res.data?.connected || false,
        usersCount: res.data?.total_users_stored || 0,
        database: res.data?.database_name || 'solarsync',
        collection: res.data?.collection || 'users'
      });
    } catch (e) {
      setMongoStatus({ connected: false, usersCount: 0 });
    }
  };

  useEffect(() => {
    loadUser();
    checkMongo();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setCurrentUser(data.user);
    checkMongo();
    return data.user;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setCurrentUser(data.user);
    checkMongo();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('solarsync_token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: Boolean(currentUser),
      userRole: currentUser ? currentUser.role : null,
      loading,
      mongoStatus,
      checkMongo,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
