import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginRequest } from '../../services/authApi'; // Import API call
import { setAccessToken, setUser, getUser, clearAuth } from '../../utils/authStorage'; // Import storage utils

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Ambil user dari localStorage saat aplikasi pertama kali dimuat
  const [currentUser, setCurrentUserState] = useState(getUser());

  // Fungsi Login yang dipanggil oleh LoginPage.jsx
  const login = async ({ email, password }) => {
    try {
      // 1. Panggil API ke Backend (pastikan authApi.js sudah pakai http://localhost:5000)
      const data = await loginRequest({ email, password });
      
      // 2. Simpan token dan data user ke localStorage (menggunakan utils Anda)
      setAccessToken(data.token);
      
      // Pisahkan token dari data user sebelum disimpan ke state
      const userData = {
        id: data.id,
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        role: data.role
      };
      
      setUser(userData);
      
      // 3. Update state aplikasi
      setCurrentUserState(userData);

      // Kembalikan data user agar bisa dibaca oleh .then(u => ...) di LoginPage
      return userData; 
    } catch (error) {
      // Lempar error ke LoginPage agar bisa ditampilkan di UI
      throw error; 
    }
  };

  // Fungsi Logout
  const logout = () => {
    clearAuth(); // Hapus dari localStorage
    setCurrentUserState(null); // Hapus dari state
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}