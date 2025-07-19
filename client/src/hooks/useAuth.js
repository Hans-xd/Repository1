// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Recarga perfil
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/me', { withCredentials: true });
      setUser(data);
    } catch (err) {
      if (err.response?.status !== 401) console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async creds => {
    await axios.post('/api/login', creds, { withCredentials: true });
    await fetchUser();
  };

  const logout = async () => {
    await axios.post('/api/logout', {}, { withCredentials: true });
    setUser(null);
  };

  // Actualiza solo campos locales sin volver a llamar al back
  const updateProfile = fields => {
    setUser(u => ({ ...u, ...fields }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      fetchUser,
      updateProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export nombrado
export function useAuth() {
  return useContext(AuthContext);
}

// Export default para que `import useAuth from ...` funcione
export default useAuth;
