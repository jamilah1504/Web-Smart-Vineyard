import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'
import { PublicPaths } from '../../routes/routePaths'
import grapeImg from '../../assets/images/anggur.jpg'
import './LandingPage.css'

export default function LandingPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Fade-in hero section dan konten utama
    animate('.js-lp-hero', {
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutQuad',
    })

    // Teks judul muncul bertahap
    animate('.js-lp-hero-title span', {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 650,
      delay: 150,
      easing: 'easeOutQuad',
    })

    // Subjudul dan tombol CTA naik pelan
    animate('.js-lp-hero-subtitle, .js-lp-hero-cta', {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 650,
      delay: 250,
      easing: 'easeOutQuad',
    })

    // Kartu statistik muncul dengan efek slide-up
    animate('.js-lp-hero-stats .lp-stat-card', {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 600,
      delay: 320,
      easing: 'easeOutQuad',
    })
  }, [])

  return (
    <div className="page page-with-padding page-shell lp-page js-lp-page">
      {/* HERO */}
      <section className="lp-hero js-lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-left">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Smart Vineyard Management System
            </div>
            <h1 className="lp-hero-title js-lp-hero-title">
              <span>Agriculture</span>
              <span>&amp; Smart</span>
              <span>Vineyard Market</span>
            </h1>
            <p className="lp-hero-subtitle js-lp-hero-subtitle">
              Pantau kelembapan tanah, nutrisi media, dan kesehatan daun anggur dengan sensor IoT
              dan AI, sehingga kebun selalu dalam kondisi terbaik.
            </p>
            <div className="lp-cta-row js-lp-hero-cta">
              <Link to={PublicPaths.login} className="btn-pill-primary lp-cta-primary">
                Masuk Dashboard
              </Link>
              <a href="#features" className="lp-cta-secondary">
                Lihat fitur sistem
              </a>
            </div>
            <div className="lp-hero-stats js-lp-hero-stats">
              <div className="lp-stat-card">
                <div className="lp-stat-value">24/7</div>
                <div className="lp-stat-label">Monitoring IoT</div>
              </div>
              <div className="lp-stat-card">
                <div className="lp-stat-value">92%</div>
                <div className="lp-stat-label">Akurasi diagnosis AI</div>
              </div>
              <div className="lp-stat-card">
                <div className="lp-stat-value">3</div>
                <div className="lp-stat-label">Role pengguna (Owner, Agronomis, Staff)</div>
              </div>
            </div>
          </div>

          <div className="lp-hero-right">
            <div className="lp-hero-visual">
              <img src={grapeImg} alt="Anggur segar di kebun" className="lp-hero-grape" />
              <div className="lp-grape-orbit">
                <div className="lp-grape-core" />
              </div>
              <div className="lp-hero-tag lp-hero-tag-top">IoT Sensors</div>
              <div className="lp-hero-tag lp-hero-tag-bottom">AI Leaf Diagnosis</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP (seperti Return Policy / Shipping / Store Locator) */}
      <section className="lp-feature-strip" id="features">
        <div className="lp-feature-strip-item">
          <h3>Real-time Monitoring</h3>
          <p>Data sensor kelembapan &amp; nutrisi diperbarui otomatis setiap beberapa detik.</p>
        </div>
        <div className="lp-feature-strip-item">
          <h3>AI Diagnosis</h3>
          <p>Analisis citra daun untuk mendeteksi gejala penyakit lebih awal.</p>
        </div>
        <div className="lp-feature-strip-item">
          <h3>Threshold &amp; Notifikasi</h3>
          <p>Atur batas aman lalu terima notifikasi saat kondisi tanaman kritis.</p>
        </div>
      </section>

      {/* SECTION: “Latest Products” versi sistem – modul utama */}
      <section className="lp-section">
        <header className="lp-section-header">
          <h2 className="lp-section-title">Modul Utama Sistem</h2>
          <p className="lp-section-subtitle">
            Semua fitur yang Anda perlukan untuk mengelola kebun anggur pintar dalam satu tempat.
          </p>
        </header>
        <div className="lp-product-grid">
          <article className="lp-product-card">
            <h3>Monitoring Lahan</h3>
            <p>Kelembapan tanah, suhu, dan kondisi media tanam dari seluruh blok kebun.</p>
          </article>
          <article className="lp-product-card">
            <h3>Monitoring Tandon</h3>
            <p>Level air &amp; nutrisi tandon, termasuk peringatan saat hampir kosong.</p>
          </article>
          <article className="lp-product-card">
            <h3>Kontrol Manual</h3>
            <p>Aktifkan pompa irigasi &amp; injeksi nutrisi langsung dari dashboard.</p>
          </article>
          <article className="lp-product-card">
            <h3>Diagnosis Penyakit AI</h3>
            <p>Upload foto daun dan dapatkan hasil klasifikasi kondisi daun.</p>
          </article>
          <article className="lp-product-card">
            <h3>Konfigurasi Threshold</h3>
            <p>
              Setel batas kelembapan &amp; nutrisi per varietas sehingga sistem bisa mengambil
              keputusan otomatis.
            </p>
          </article>
          <article className="lp-product-card">
            <h3>Laporan &amp; Prediksi Tren</h3>
            <p>Laporan historis sensor &amp; aktivitas sistem untuk Analisis Owner dan Agronomis.</p>
          </article>
        </div>
      </section>

      {/* SECTION: Banner “Be Healthy...” */}
      <section className="lp-banner">
        <div className="lp-banner-content">
          <h2>Be Healthy &amp; Grow Only Fresh Organic Grapes</h2>
          <p>
            Dengan monitoring yang presisi dan respons cepat terhadap kondisi tanaman, kualitas buah
            anggur meningkat dan risiko gagal panen berkurang.
          </p>
          <Link to={PublicPaths.login} className="btn-pill-primary">
            Mulai Pantau Sekarang
          </Link>
        </div>
      </section>

      {/* SECTION: Testimonial & News (ringkas) */}
      <section className="lp-section lp-section-split">
        <div className="lp-testimonials">
          <h2 className="lp-section-title">Apa Kata Pengguna</h2>
          <div className="lp-testimonial-card">
            <p>
              “Setelah pakai Smart Vineyard, jadwal penyiraman jauh lebih terukur dan daun yang
              bermasalah bisa cepat terdeteksi.”
            </p>
            <span className="lp-testimonial-name">– Agronomis Saung Tinanggur</span>
          </div>
        </div>
        <div className="lp-news">
          <h2 className="lp-section-title">News &amp; Articles</h2>
          <div className="lp-news-grid">
            <article className="lp-news-card">
              <h3>Optimasi Nutrisi untuk Varietas Jupiter</h3>
              <p>
                Tips mengatur threshold kelembapan &amp; nutrisi khusus varietas Jupiter berbasis
                data sensor.
              </p>
            </article>
            <article className="lp-news-card">
              <h3>Mendeteksi Penyakit Daun Lebih Awal</h3>
              <p>
                Bagaimana AI membantu mendeteksi klorosis &amp; nekrosis sebelum gejalanya
                menyebar.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FOOTER RINGKAS */}
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div className="lp-footer-brand">
            <div className="sidebar-logo">Smart Vineyard</div>
            <div className="sidebar-subtitle">Saung Tinanggur · Smart Farming</div>
          </div>
          <div className="lp-footer-links">
            <div>
              <h4>Modul</h4>
              <ul>
                <li>Monitoring IoT</li>
                <li>Analisis AI</li>
                <li>Laporan &amp; Tren</li>
              </ul>
            </div>
            <div>
              <h4>Kontak</h4>
              <ul>
                <li>Email: info@smart-vineyard.local</li>
                <li>Lokasi: Saung Tinanggur</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          © {new Date().getFullYear()} Smart Vineyard. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

