// // src/config/firebase.js
// const admin = require("firebase-admin");

// // Perbaiki path dengan menambahkan .json
// const serviceAccount = require("../flutter-firebase-kts-954ff-firebase-adminsdk-fbsvc-133077dc8c.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const messaging = admin.messaging(); // Untuk FCM push
// const db = admin.firestore(); // Untuk simpan ke Firestore

// module.exports = { admin, messaging, db };

const admin = require("firebase-admin");
const path = require("path");

// 1. Pastikan nama file ini SAMA PERSIS dengan file JSON yang Anda download dari Firebase Console
// Letakkan file json ini SEJAJAR dengan folder 'src' atau di dalam folder 'src/config'
const serviceAccount = require("../../fertigasi-system-firebase-adminsdk-fbsvc-502447c08d.json"); // Ganti dengan nama file JSON Anda


try {
  // PERBAIKAN: Cek dulu apakah apps sudah ada isinya atau belum
  // Ini mencegah error "Firebase app named [DEFAULT] already exists"
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin berhasil terhubung (New Instance)!");
  } else {
    // Jika sudah ada, kita gunakan instance yang sudah berjalan
    admin.app(); 
    console.log("♻️ Firebase Admin menggunakan instance yang sudah ada.");
  }

} catch (error) {
  console.error("❌ Gagal inisialisasi Firebase:", error);
}

const messaging = admin.messaging();

module.exports = { messaging };