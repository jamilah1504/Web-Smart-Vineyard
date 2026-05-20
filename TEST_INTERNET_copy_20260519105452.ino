/*
 * Proyek: Aetera Smart Vineyard - ONLINE MODE (FULL INTEGRATION)
 * Deskripsi: Baca Sensor NPK & Ultrasonik + Kirim/Terima Web
 * Konfigurasi: POMPA GANDA (Air & Pupuk) - RELAY AKTIF HIGH
 * Pembaruan: Ambang Batas Kelembapan (Threshold) Dinamis dari Web
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ==========================================
// KONFIGURASI WIFI & API
// ==========================================
const char* ssid = "MENCERAHKAN";
const char* password = "aaaaaaaa";

const char* apiControlUrl = "https://d34f3d5l-5000.asse.devtunnels.ms/api/controls/pump/ESP32-MAC-A001";
const char* apiPostUrl = "https://d34f3d5l-5000.asse.devtunnels.ms/api/sensor/data";

// ==========================================
// KONFIGURASI PIN HARDWARE
// ==========================================
#define DE_PIN 13 
#define RE_PIN 14 
#define RX_PIN 26 
#define TX_PIN 27   
#define TRIG_PIN 18
#define ECHO_PIN 19

#define PIN_POMPA_AIR 4      
#define PIN_POMPA_PUPUK 22   

// ==========================================
// DIMENSI TANDON (Untuk Hitung Volume)
// ==========================================
const float JARI_JARI_TANDON = 20.0; // cm
const float TINGGI_MAX_TANDON = 42.0; // cm

// 🌟 Ambang Batas Dinamis (Akan di-update (overwrite) oleh data dari Web)
float batasKering = 40.0; 

const byte npkQuery[] = {0x01, 0x03, 0x00, 0x00, 0x00, 0x07, 0x04, 0x08};
byte values[20]; 

bool isPompaAirON = false;
bool isPompaPupukON = false;

unsigned long lastPostTime = 0;
const unsigned long postInterval = 15000; 

// Variabel Global Sensor
float moisture = 0, suhu = 0, ph = 0;
int ec = 0, n = 0, p = 0, k = 0;
float sisaTinggiAir = 0;
float volumeAirLiter = 0; 
float jarakSensor = 0; 

void setup() {
  Serial.begin(115200); 
  Serial2.begin(4800, SERIAL_8N1, RX_PIN, TX_PIN); 
  Serial2.setTimeout(1000); 
  
  pinMode(DE_PIN, OUTPUT); pinMode(RE_PIN, OUTPUT);
  digitalWrite(DE_PIN, LOW); digitalWrite(RE_PIN, LOW); 
  
  pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT);

  pinMode(PIN_POMPA_AIR, OUTPUT);
  pinMode(PIN_POMPA_PUPUK, OUTPUT);
  digitalWrite(PIN_POMPA_AIR, LOW);    
  digitalWrite(PIN_POMPA_PUPUK, LOW); 
  
  Serial.print("Menghubungkan ke WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\n✅ WiFi Terhubung!");
}

void loop() {
  Serial.println("\n==========================================");
  
  // --------------------------------------------------
  // 1. BACA SENSOR ULTRASONIK & HITUNG VOLUME
  // --------------------------------------------------
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  
  jarakSensor = duration * 0.034 / 2;
  
  float currentTinggiAir = TINGGI_MAX_TANDON - jarakSensor; 
  if (currentTinggiAir > 0 && currentTinggiAir <= TINGGI_MAX_TANDON) {
    sisaTinggiAir = currentTinggiAir;
  } else if (currentTinggiAir > TINGGI_MAX_TANDON) {
    sisaTinggiAir = TINGGI_MAX_TANDON; // Mencegah nilai lebih jika sensor error sesaat
  } else {
    sisaTinggiAir = 0;
  }

  volumeAirLiter = (3.14159 * JARI_JARI_TANDON * JARI_JARI_TANDON * sisaTinggiAir) / 1000.0;

  Serial.printf("💧 TANDON AIR -> Jarak Sensor: %0.1f cm | Tinggi Air: %0.1f cm | Volume: %0.2f L\n", jarakSensor, sisaTinggiAir, volumeAirLiter);
  Serial.println("------------------------------------------");

  // --------------------------------------------------
  // 2. BACA SENSOR TANAH NPK 7-IN-1
  // --------------------------------------------------
  while(Serial2.available()) Serial2.read(); 
  digitalWrite(DE_PIN, HIGH); digitalWrite(RE_PIN, HIGH); delay(10);
  Serial2.write(npkQuery, sizeof(npkQuery)); Serial2.flush();
  digitalWrite(DE_PIN, LOW); digitalWrite(RE_PIN, LOW); delay(100); 

  if (Serial2.readBytes(values, 19) == 19) {
    moisture = ((values[3] << 8) | values[4]) / 10.0;
    suhu     = ((values[5] << 8) | values[6]) / 10.0;
    ec       = (values[7] << 8) | values[8];
    ph       = ((values[9] << 8) | values[10]) / 10.0;
    n        = (values[11] << 8) | values[12];
    p        = (values[13] << 8) | values[14];
    k        = (values[15] << 8) | values[16];

    Serial.printf("🌱 DATA TANAH -> M:%0.1f%% | T:%0.1f°C | pH:%0.1f\n", moisture, suhu, ph);
    Serial.printf("   N:%d | P:%d | K:%d | EC:%d\n", n, p, k, ec);
  } else {
    Serial.println("⚠️ Gagal membaca NPK. Pakai data terakhir.");
  }

  // --------------------------------------------------
  // 3. KONEKSI KE BACKEND (WEB)
  // --------------------------------------------------
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); 

    // =======================================================
    // A. POST: KIRIM DATA SENSOR (Setiap 15 Detik)
    // =======================================================
    if (millis() - lastPostTime >= postInterval) {
       lastPostTime = millis();
       HTTPClient httpPost;
       httpPost.begin(client, apiPostUrl);
       httpPost.addHeader("Content-Type", "application/json");
       httpPost.addHeader("Bypass-Tunnel-Reminder", "true");

       DynamicJsonDocument postDoc(512);
       postDoc["perangkat_id"]     = "ESP32-MAC-A001"; 
       postDoc["kelembapan_tanah"] = moisture;
       postDoc["suhu_tanah"]       = suhu;
       postDoc["ph_tanah"]         = ph;
       postDoc["ketinggian_air"]   = sisaTinggiAir;
       postDoc["ec"]               = ec;
       postDoc["nitrogen"]         = n;
       postDoc["fosfor"]           = p;
       postDoc["kalium"]           = k;
       postDoc["jenis_tandon"]     = "air";

       String requestBody;
       serializeJson(postDoc, requestBody);

       Serial.println("📤 Mengirim data sensor ke Backend...");
       int postResponseCode = httpPost.POST(requestBody);

       if (postResponseCode > 0) {
          Serial.printf("   ✅ Sukses! (HTTP %d)\n", postResponseCode);
       } else {
          Serial.printf("   ❌ Gagal! (HTTP %d)\n", postResponseCode);
       }
       httpPost.end();
    }

    // =======================================================
    // B. GET: MINTA INSTRUKSI KONTROL & THRESHOLD
    // =======================================================
    HTTPClient httpGet;
    httpGet.begin(client, apiControlUrl);
    httpGet.addHeader("Bypass-Tunnel-Reminder", "true");

    int getResponseCode = httpGet.GET();

    if (getResponseCode > 0) {
      String payload = httpGet.getString();
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload);

      if (!error && doc["status"] == "success") {
        String mode_kerja = doc["data"]["mode_kerja"] | "auto";
        bool perintah_air = doc["data"]["status_pompa_air"];
        bool perintah_pupuk = doc["data"]["status_pompa_pupuk"];

        // 🌟 PERBAIKAN: Key diubah menjadi 'batas_kering' sesuai dengan respons Node.js
        if (doc["data"].containsKey("batas_kering")) {
            batasKering = doc["data"]["batas_kering"];
        }

        Serial.println("🌐 Mode Web : " + mode_kerja);
        Serial.printf("📊 Ambang Batas Air (Threshold): %0.1f%%\n", batasKering);

        if (mode_kerja == "manual") {
          // --- MODE MANUAL ---
          if (perintah_air != isPompaAirON) {
             isPompaAirON = perintah_air;
             digitalWrite(PIN_POMPA_AIR, isPompaAirON ? HIGH : LOW);
             Serial.println(isPompaAirON ? "   🕹️ Pompa Air: ON" : "   🕹️ Pompa Air: OFF");
             delay(1000); 
          }

          if (perintah_pupuk != isPompaPupukON) {
             isPompaPupukON = perintah_pupuk;
             digitalWrite(PIN_POMPA_PUPUK, isPompaPupukON ? HIGH : LOW);
             Serial.println(isPompaPupukON ? "   🕹️ Pompa Pupuk: ON" : "   🕹️ Pompa Pupuk: OFF");
          }

        } else {
          // --- MODE AUTO (AKTIF HIGH) DENGAN PENGAMAN TANDON AIR ---
          float ambangBatasAman = 5.0; // 5 cm sebagai batas minimal air

          // 🌟 SYARAT NYALA: Tanah Kering (< batasKering) DAN Air Cukup (> 5 cm)
          if (moisture > 0 && moisture < batasKering && sisaTinggiAir > ambangBatasAman) {
            if (!isPompaAirON || !isPompaPupukON) {
              digitalWrite(PIN_POMPA_AIR, HIGH);
              isPompaAirON = true; 
              delay(2000); 
              
              digitalWrite(PIN_POMPA_PUPUK, HIGH);
              isPompaPupukON = true;
              Serial.println("   🟢 Fertigasi AUTO: ON (Air Cukup & Tanah Kering)");
            }
          } else {
            // SYARAT MATI: Tanah lembap ATAU Air kritis
            if (isPompaAirON || isPompaPupukON) {
              digitalWrite(PIN_POMPA_PUPUK, LOW); 
              isPompaPupukON = false;    
              delay(1000); 
              digitalWrite(PIN_POMPA_AIR, LOW); 
              isPompaAirON = false;
              
              if (sisaTinggiAir <= ambangBatasAman) {
                Serial.println("   🔴 Fertigasi AUTO: OFF (⚠️ AIR KRITIS!)");
              } else {
                Serial.println("   🔴 Fertigasi AUTO: OFF (Tanah Lembap / Cukup)");
              }
            }
          }
        }
      }
    }
    httpGet.end();
  }
  
  delay(3000); 
}