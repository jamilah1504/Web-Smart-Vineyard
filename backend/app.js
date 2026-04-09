const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ==========================================================
// 1. MIDDLEWARE (WAJIB DI ATAS ROUTE)
// ==========================================================
app.use(cors());

// PINDAHKAN INI KE ATAS SEBELUM "IMPOR ROUTE"
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Menyajikan file statis
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ==========================================================
// 2. IMPOR ROUTE 
// ==========================================================
const authRoutes = require("./src/routes/authRoutes");
const varietasRoutes = require("./src/routes/varietasRoutes");
const perangkatRoutes = require("./src/routes/perangkatRoutes");
const sensorRoutes = require("./src/routes/sensorRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const diagnosisRoutes = require('./src/routes/diagnosisRoutes');
const userRoutes = require("./src/routes/userRoutes");
const trendRoutes = require('./src/routes/trendRoutes');
const controlRoutes = require('./src/routes/controlRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// ==========================================================
// 3. GUNAKAN ROUTE
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/varietas", varietasRoutes);
app.use("/api/perangkat", perangkatRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/controls', controlRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Route sederhana untuk tes
app.get("/", (req, res) => {
  res.send("API Sistem Sensor Anggur is running...");
});

module.exports = app;