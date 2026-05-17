import cv2
import numpy as np
import urllib.request
import requests
import base64
import time

# ==========================================
# 1. KONFIGURASI KAMERA, ROBOFLOW & BACKEND
# ==========================================
# Pastikan IP ini sesuai dengan yang di Serial Monitor
url_kamera = 'http://10.103.16.26/cam-hi.jpg' 

ROBOFLOW_API_KEY = "XLaeFaRtaO2lzuZIrgrY" 
API_ROBOFLOW = f"https://serverless.roboflow.com/daun_anggur-8kryf/1?api_key={ROBOFLOW_API_KEY}"
API_BACKEND_WEB = "https://d34f3d5l-5000.asse.devtunnels.ms/api/diagnosis/detect"

JEDA_KIRIM_DETIK = 60 
waktu_kirim_terakhir = 0 

print("🚀 Memulai Sistem Visi Smart Vineyard (Mode: Klasifikasi Gambar + Base64)...")

while True:
    try:
        # --- A. AMBIL GAMBAR DARI ESP32-CAM ---
        img_resp = urllib.request.urlopen(url_kamera)
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        im = cv2.imdecode(imgnp, -1)
        im = cv2.flip(im, -1) 

        # --- B. KIRIM KE ROBOFLOW ---
        retval, buffer = cv2.imencode('.jpg', im)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        resp_roboflow = requests.post(
            API_ROBOFLOW,
            data=img_base64,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        # --- C. BACA HASIL KLASIFIKASI ---
        if resp_roboflow.status_code == 200:
            data = resp_roboflow.json()
            predictions = data.get('predictions', [])
            
            status_terdeteksi = "Kosong"
            akurasi_tertinggi = 0
            
            # Jika AI berhasil menebak
            if len(predictions) > 0:
                # Ambil hasil tebakan yang paling meyakinkan (urutan pertama)
                pred_utama = predictions[0]
                status_terdeteksi = pred_utama.get('class', 'Tidak Diketahui')
                akurasi_tertinggi = pred_utama.get('confidence', 0.0)
                
                # Menentukan warna tulisan (Hijau = Sehat, Merah = Sakit)
                color = (0, 255, 0) if status_terdeteksi.lower() == 'sehat' else (0, 0, 255)
                
                # Tulis Hasil di Layar Kamera
                teks_hasil = f"STATUS DAUN: {status_terdeteksi.upper()} ({int(akurasi_tertinggi * 100)}%)"
                cv2.putText(im, teks_hasil, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
            
            # --- D. UPLOAD KE DATABASE WEB (REVISI BASE64) ---
            waktu_sekarang = time.time()
            if status_terdeteksi != "Kosong" and (waktu_sekarang - waktu_kirim_terakhir) >= JEDA_KIRIM_DETIK:
                print(f"\n⏳ Mengirim data [{status_terdeteksi}] ke Web Database...")
                
                # Encode gambar ke Base64
                _, buffer_upload = cv2.imencode('.jpg', im)
                img_as_text = base64.b64encode(buffer_upload).decode('utf-8')
                
                # Kirim sebagai JSON murni (agar req.body terbaca)
                payload_json = {
                    "perangkat_id": "ESPCAM-001",
                    "hasil_diagnosis": status_terdeteksi,     # Mengirim hasil status
                    "confidence_score": float(akurasi_tertinggi),    # Mengirim tingkat akurasi
                    "image_base64": img_as_text           # Mengirim gambar sebagai teks panjang
                }
                
                headers_web = {
                    "Bypass-Tunnel-Reminder": "true", # 🌟 WAJIB DITAMBAHKAN UNTUK DEVTUNNELS
                    "X-Tunnel-Skip-Anti-Phishing-Page": "true",
                    "Content-Type": "application/json" 
                }
                
                try:
                    resp_web = requests.post(API_BACKEND_WEB, json=payload_json, headers=headers_web)
                    if resp_web.status_code in [200, 201]:
                        print("✅ Gambar & Status sukses tersimpan di Web!")
                        waktu_kirim_terakhir = waktu_sekarang 
                    else: 
                        print(f"❌ Gagal Simpan Web: {resp_web.status_code} - {resp_web.text}")
                except Exception as e_web: 
                    print(f"❌ Error Jaringan Web: {e_web}")

        # Tampilkan Jendela UI di Layar Laptop
        cv2.imshow('Kamera Cerdas Saung Tinanggur', im)
        
        # Tombol Kontrol (q = Keluar, s = Paksa Kirim)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'): 
            break
        elif key == ord('s'): 
            waktu_kirim_terakhir = 0 
            print("📸 Tombol 'S' ditekan! Memaksa upload...")

    except Exception as e:
        print(f"Error Loop: {e}")
        time.sleep(2)

cv2.destroyAllWindows()