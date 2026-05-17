import React, { createContext, useContext, useState } from 'react';
import { loginRequest } from '../../services/authApi'; 
import { setAccessToken, setUser, getUser, clearAuth } from '../../utils/authStorage'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(getUser());

  // 1. Fungsi Login Manual (Biarkan seperti aslinya)
  const login = async ({ email, password }) => {
    try {
      const data = await loginRequest({ email, password });
      setAccessToken(data.token);
      const userData = {
        id: data.id,
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        role: data.role
      };
      setUser(userData);
      setCurrentUserState(userData);
      return userData; 
    } catch (error) {
      throw error; 
    }
  };

  // 2. 🌟 FUNGSI BARU KHUSUS UNTUK GOOGLE LOGIN
  const loginWithGoogle = (dataDariBackend) => {
    // Simpan ke localStorage pakai utils kamu
    setAccessToken(dataDariBackend.token);
    
    // Rakit KTP User (Pastikan role terisi)
    const userData = {
      id: dataDariBackend.id,
      nama_lengkap: dataDariBackend.nama_lengkap,
      email: dataDariBackend.email,
      role: dataDariBackend.role || 'Staff' // Beri default 'Staff' jika kosong
    };
    
    setUser(userData);
    
    // Beritahu otak React bahwa user sudah masuk (Ini yang bikin tidak ditendang Satpam!)
    setCurrentUserState(userData);
    
    return userData;
  };

  const logout = () => {
    clearAuth(); 
    setCurrentUserState(null); 
  };

  return (
    // 3. 🌟 DAFTARKAN FUNGSI BARU KE PROVIDER
    <AuthContext.Provider value={{ currentUser, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}