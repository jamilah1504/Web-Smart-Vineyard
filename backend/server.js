require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app"); // Mengambil konfigurasi dari app.js
const { connectDB } = require("./src/config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const PORT = process.env.PORT || 5000;

// Panggil Koneksi Database
connectDB();

// Membuat server HTTP dari instance Express
const server = http.createServer(app);

// Inisialisasi Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Menangani koneksi WebSocket
io.on("connection", (socket) => {
  console.log("🟢 Klien terhubung:", socket.id);

  // Contoh: Jika ada data sensor baru masuk
  socket.on("sensorData", (data) => {
    console.log("Data Sensor Baru:", data);
    // Kirim data ke semua dashboard yang sedang membuka web
    io.emit("updateDashboard", data); 
  });

  socket.on("disconnect", () => {
    console.log("🔴 Klien terputus:", socket.id);
  });
});

// Menjalankan server - Semua interface jaringan (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server berjalan di port ${PORT}`);
  
  // Script untuk menampilkan IP Laptop otomatis
  const os = require('os');
  const networks = os.networkInterfaces();
  let myIP = 'localhost';

  for (const name of Object.keys(networks)) {
      for (const net of networks[name]) {
          if (net.family === 'IPv4' && !net.internal) {
              myIP = net.address;
              break;
          }
      }
  }
  
  console.log(`📲 Untuk akses dari Hardware (ESP32/NodeMCU) atau HP, gunakan IP ini:`);
  console.log(`👉 http://${myIP}:${PORT}`);
  console.log(`-----------------------------------------------\n`);
});