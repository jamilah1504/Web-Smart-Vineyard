import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'
import { PublicPaths } from '../../routes/routePaths'
import grapeImg from '../../assets/images/anggur.jpg'
import './LandingPage.css'

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-header-brand">
            <div
              className="lp-header-logo"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileNavOpen(false) }}
              onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
              role="button"
              tabIndex={0}
            >
              <div className="lp-header-logo-icon">🌱</div>
              <div className="lp-header-logo-text">
                <div>Smart Vineyard</div>
                <div>Saung Tinanggur</div>
              </div>
            </div>
            <div className="lp-header-search">
              <span>🔍</span>
              <input type="text" placeholder="Cari fitur..." />
            </div>
          </div>

          <button
            type="button"
            className="lp-header-toggle"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? '✕' : '☰'}
          </button>

          <nav className={`lp-header-nav ${mobileNavOpen ? 'open' : ''}`}>
            <a href="#top" className="active" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileNavOpen(false) }}>BERANDA</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMobileNavOpen(false) }}>FITUR</a>
            <a href="#sma-video-section" onClick={(e) => { e.preventDefault(); document.getElementById('sma-video-section')?.scrollIntoView({ behavior: 'smooth' }); setMobileNavOpen(false) }}>VIDEO</a>
            <a href="#lp-section" onClick={(e) => { e.preventDefault(); document.querySelector('.lp-section')?.scrollIntoView({ behavior: 'smooth' }); setMobileNavOpen(false) }}>TENTANG KAMI</a>
            <a href="#footer" onClick={(e) => { e.preventDefault(); document.querySelector('.lp-footer')?.scrollIntoView({ behavior: 'smooth' }); setMobileNavOpen(false) }}>KONTAK</a>
            <Link to={PublicPaths.login} className="lp-header-cta" onClick={() => setMobileNavOpen(false)}>Masuk</Link>
          </nav>
        </div>
      </header>

{/* KUMPULAN STYLE KHUSUS HERO & FEATURE STRIP */}
      <style>{`
        /* --- HERO SECTION --- */
        .hero-section {
          position: relative;
          padding: 120px 20px 180px; 
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          overflow: hidden;
        }
        
        .hero-bg-shape-1 {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(39,174,96,0.08) 0%, rgba(255,255,255,0) 70%);
          z-index: 0;
        }
        
        .hero-bg-shape-2 {
          position: absolute;
          bottom: 50px;
          left: -150px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(52,152,219,0.05) 0%, rgba(255,255,255,0) 70%);
          z-index: 0;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #27ae60 0%, #00b09b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* --- MENGAMBANG & ANIMASI --- */
        .glass-badge {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #2c3e50;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }

        /* --- FEATURE STRIP (CARDS) --- */
        .feature-strip-container {
          max-width: 1200px;
          margin: -100px auto 60px; /* Overlap ke atas hero */
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* Default Desktop: 3 Kolom */
          gap: 24px;
          padding: 0 20px;
        }

        .feature-strip-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 35px 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          border: 1px solid rgba(255, 255, 255, 1);
          border-bottom: 4px solid #2ecc71; /* Aksen garis bawah */
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Efek pantulan (bouncy) */
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .feature-strip-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 50px rgba(39, 174, 96, 0.15);
          border-bottom: 4px solid #27ae60;
        }

        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
          transition: transform 0.3s ease;
        }

        .feature-strip-card:hover .feature-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        /* --- RESPONSIVE MEDIA QUERIES (SANGAT PENTING) --- */
        
        /* 1. Tablet (Di bawah 992px) */
        @media (max-width: 992px) {
          .feature-strip-container {
            grid-template-columns: repeat(2, 1fr); /* Jadi 2 Kolom */
          }
          /* Kartu ke-3 agar posisinya di tengah jika sisa 1 */
          .feature-strip-card:nth-child(3) {
            grid-column: 1 / -1; 
            max-width: 50%;
            margin: 0 auto;
          }
        }

        /* 2. Mobile / HP (Di bawah 768px) */
        @media (max-width: 768px) {
          .hero-section {
            padding: 100px 15px 140px;
            text-align: center;
          }
          .hero-section .lp-cta-row {
            justify-content: center;
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          .hero-section .lp-cta-row > * {
            width: 100%;
            text-align: center;
            box-sizing: border-box;
          }
          .hero-section .lp-hero-stats {
            justify-content: center;
            flex-wrap: wrap;
          }
          
          /* Penyesuaian Visual Kanan untuk HP */
          .glass-badge {
            padding: 8px 16px;
            font-size: 12px;
          }
          .glass-badge:nth-of-type(1) { right: 0px; top: 10px; }
          .glass-badge:nth-of-type(2) { left: 0px; bottom: 10px; }

          /* Kartu Fitur Jadi 1 Kolom Penuh di HP */
          .feature-strip-container {
            grid-template-columns: 1fr; 
            margin-top: -60px; /* Jarak overlap dikurangi sedikit di HP */
            gap: 16px;
          }
          .feature-strip-card:nth-child(3) {
            max-width: 100%; /* Kembalikan ke lebar penuh di HP */
          }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="hero-section" id="hero">
        <div className="hero-bg-shape-1"></div>
        <div className="hero-bg-shape-2"></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '50px', position: 'relative', zIndex: 1 }}>
          
          {/* BAGIAN KIRI: Teks & CTA */}
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', backgroundColor: '#e8f5e9', color: '#27ae60', borderRadius: '30px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#2ecc71', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #2ecc71' }} />
              Smart Vineyard Management System
            </div>
            
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', color: '#2c3e50', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
              Agriculture &amp; Smart <br />
              <span className="hero-gradient-text">Vineyard Market</span>
            </h1>
            
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#7f8c8d', lineHeight: '1.7', marginBottom: '40px', maxWidth: '540px', marginInline: 'auto' }}>
              Pantau kelembapan tanah, nutrisi media, dan kesehatan daun anggur secara presisi dengan integrasi sensor IoT dan kecerdasan buatan (AI). Kebun Anda, selalu dalam kondisi terbaik.
            </p>
            
            <div className="lp-cta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '50px' }}>
              <Link 
                to={PublicPaths.login} 
                style={{ backgroundColor: '#27ae60', color: '#fff', padding: '16px 32px', borderRadius: '50px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', boxShadow: '0 8px 20px rgba(39, 174, 96, 0.3)', transition: 'all 0.3s' }}
              >
                Masuk Dashboard ➔
              </Link>
              <a 
                href="#features" 
                style={{ color: '#34495e', padding: '16px 24px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'color 0.3s' }}
              >
                Lihat Fitur Sistem
              </a>
            </div>

            {/* Statistik Garis Bawah */}
            <div className="lp-hero-stats" style={{ display: 'flex', gap: '20px', borderTop: '2px solid #ecf0f1', paddingTop: '30px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#2c3e50' }}>24/7</div>
                <div style={{ fontSize: '12px', color: '#95a5a6', fontWeight: '600', textTransform: 'uppercase' }}>Monitoring IoT</div>
              </div>
              <div style={{ width: '2px', backgroundColor: '#ecf0f1' }}></div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#2c3e50' }}>92%</div>
                <div style={{ fontSize: '12px', color: '#95a5a6', fontWeight: '600', textTransform: 'uppercase' }}>Akurasi AI</div>
              </div>
              <div style={{ width: '2px', backgroundColor: '#ecf0f1' }}></div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#2c3e50' }}>3 Role</div>
                <div style={{ fontSize: '12px', color: '#95a5a6', fontWeight: '600', textTransform: 'uppercase' }}>Sistem Akses</div>
              </div>
            </div>
          </div>

          {/* BAGIAN KANAN: Visual Dinamis */}
          <div style={{ flex: '1 1 400px', position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '1/1' }}>
              <div style={{ position: 'absolute', top: '5%', left: '5%', right: '5%', bottom: '5%', border: '2px dashed rgba(39, 174, 96, 0.3)', borderRadius: '50%', animation: 'spin 25s linear infinite' }}></div>
              
              {/* Gambar Utama */}
              <img 
                src={grapeImg} 
                alt="Anggur segar di kebun" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '30px 100px 30px 100px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', position: 'relative', zIndex: 2 }} 
              />
              
              <div className="glass-badge animate-float" style={{ position: 'absolute', top: '10%', right: '-5%', zIndex: 3 }}>
                <span style={{ fontSize: '20px' }}>📡</span> IoT Sensors
              </div>
              
              <div className="glass-badge animate-float-delayed" style={{ position: 'absolute', bottom: '15%', left: '-10%', zIndex: 3 }}>
                <span style={{ fontSize: '20px' }}>🤖</span> AI Diagnosis
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURE STRIP (OVERLAPPING & FULLY RESPONSIVE) */}
      <section id="features" className="feature-strip-container">
        
        <div className="feature-strip-card">
          <div className="feature-icon-wrapper" style={{ backgroundColor: '#e8f5e9', color: '#27ae60' }}>
            ⏱️
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', marginBottom: '12px' }}>Real-time Monitoring</h3>
          <p style={{ fontSize: '15px', color: '#7f8c8d', lineHeight: '1.7', margin: 0 }}>
            Data sensor kelembapan & nutrisi dari tandon maupun lahan diperbarui otomatis setiap beberapa detik tanpa perlu muat ulang halaman.
          </p>
        </div>

        <div className="feature-strip-card">
          <div className="feature-icon-wrapper" style={{ backgroundColor: '#e3f2fd', color: '#2980b9' }}>
            🔬
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', marginBottom: '12px' }}>AI Diagnosis</h3>
          <p style={{ fontSize: '15px', color: '#7f8c8d', lineHeight: '1.7', margin: 0 }}>
            Analisis citra visual daun cerdas untuk mendeteksi gejala klorosis, nekrosis, dan hama lebih awal demi mencegah gagal panen.
          </p>
        </div>

        <div className="feature-strip-card">
          <div className="feature-icon-wrapper" style={{ backgroundColor: '#fff3e0', color: '#d35400' }}>
            🔔
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2c3e50', marginBottom: '12px' }}>Threshold & Notifikasi</h3>
          <p style={{ fontSize: '15px', color: '#7f8c8d', lineHeight: '1.7', margin: 0 }}>
            Tentukan sendiri batas minimum kebutuhan varietas anggur Anda, lalu terima peringatan langsung saat kondisi kritis terpenuhi.
          </p>
        </div>

      </section>

{/* SECTION: “Latest Products” / Modul Utama */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
        {/* Style khusus untuk efek hover dan ikon (disematkan langsung agar rapi) */}
        <style>{`
          .lp-feature-card {
            background-color: #ffffff;
            border-radius: 20px;
            padding: 35px 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .lp-feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.08);
            border-color: #ecf0f1;
          }
          .lp-icon-box {
            width: 65px;
            height: 65px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 24px;
          }
        `}</style>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Section */}
          <header style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ 
              display: 'inline-block', padding: '6px 16px', backgroundColor: '#e8f5e9', 
              color: '#27ae60', borderRadius: '20px', fontSize: '12px', fontWeight: '700', 
              letterSpacing: '1px', marginBottom: '15px', textTransform: 'uppercase'
            }}>
              Fitur Lengkap
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#2c3e50', marginBottom: '15px', lineHeight: '1.2' }}>
              Modul Utama Sistem
            </h2>
            <p style={{ fontSize: '16px', color: '#7f8c8d', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Semua fitur yang Anda perlukan untuk mengelola kebun anggur pintar secara presisi dan otomatis dalam satu tempat.
            </p>
          </header>

          {/* Grid Modul */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '30px' 
          }}>
            
            {/* Card 1: Monitoring Lahan */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#e8f5e9', color: '#27ae60' }}>🌱</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Monitoring Lahan
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Pantau kelembapan tanah, tingkat pH, dan nutrisi NPK/EC dari seluruh blok kebun secara real-time.
              </p>
            </article>

            {/* Card 2: Monitoring Tandon */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#e3f2fd', color: '#3498db' }}>💧</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Monitoring Tandon
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Ketahui level sisa air dan nutrisi pada tandon. Sistem dilengkapi fitur proteksi peringatan saat hampir kosong.
              </p>
            </article>

            {/* Card 3: Kontrol Manual */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#fce4ec', color: '#e91e63' }}>⚙️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Kontrol Jarak Jauh
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Ambil alih sistem kapan saja. Aktifkan atau matikan pompa irigasi dan injeksi nutrisi langsung dari dashboard.
              </p>
            </article>

            {/* Card 4: AI Diagnosis */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#f3e5f5', color: '#9b59b6' }}>🤖</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Diagnosis Penyakit AI
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Tangkap foto daun melalui ESP-CAM atau unggah foto dari galeri untuk mendeteksi penyakit daun secara akurat.
              </p>
            </article>

            {/* Card 5: Threshold Config */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#fff8e1', color: '#f39c12' }}>🎛️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Konfigurasi Ambang Batas
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Tentukan sendiri batas minimum kelembapan dan nutrisi agar sistem AI dapat menyiram otomatis sesuai kebutuhan varietas.
              </p>
            </article>

            {/* Card 6: Laporan */}
            <article className="lp-feature-card">
              <div className="lp-icon-box" style={{ backgroundColor: '#e0f7fa', color: '#00bcd4' }}>📊</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '12px' }}>
                Laporan & Prediksi Tren
              </h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                Analisis data historis sensor dan aktivitas sistem untuk membantu Owner dan Agronomis mengambil keputusan strategis.
              </p>
            </article>

          </div>
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

      {/* SECTION: Video Demo Sistem */}
      <section id="sma-video-section" style={{ padding: '80px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Section */}
          <header style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ 
              display: 'inline-block', padding: '8px 16px', backgroundColor: '#ffebee', 
              color: '#c62828', borderRadius: '20px', fontSize: '12px', fontWeight: '700', 
              letterSpacing: '1px', marginBottom: '15px', textTransform: 'uppercase'
            }}>
              🎥 Demo Sistem
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#2c3e50', marginBottom: '15px', lineHeight: '1.2' }}>
              Lihat Smart Vineyard Beraksi
            </h2>
            <p style={{ fontSize: '16px', color: '#7f8c8d', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', marginBottom: '30px' }}>
              Saksikan tayangan lengkap integrasi sensor IoT, AI diagnosis, dan kontrol otomatis dalam aksi
            </p>

            {/* Manual Book Button */}
            <a 
              href="/manual_book_aetera.docx"
              download
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#2c5f2d',
                padding: '12px 32px',
                borderRadius: '28px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'inline-block',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
              }}
            >
              📘 Download Manual Book
            </a>
          </header>

          {/* Video Container (Responsive 16:9) */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '8px solid #f8f9fa',
            backgroundColor: '#000'
          }}>
          <iframe 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            src="https://www.youtube.com/embed/9LVn8DqpeGw?rel=0" 
            title="Demo Smart Vineyard Management" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
          </div>

        </div>
      </section>

{/* SECTION: Tentang Saung Tinanggur (Bento Box Style - FIXED MAP) */}
      <section style={{ padding: '100px 20px', backgroundColor: '#f8f9fa' }}>
        <style>{`
          .bento-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .bento-card {
            background-color: #ffffff;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.04);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }
          .bento-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          }
          .span-2 { grid-column: span 2; }
          .span-3 { grid-column: span 3; }
          
          @media (max-width: 960px) {
            .bento-grid { grid-template-columns: repeat(2, 1fr); }
            .span-3 { grid-column: span 2; }
          }
          @media (max-width: 768px) {
            .bento-grid { grid-template-columns: 1fr; }
            .span-2, .span-3 { grid-column: span 1; }
          }
        `}</style>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{ 
              display: 'inline-block', padding: '8px 18px', backgroundColor: '#e8f5e9', 
              color: '#27ae60', borderRadius: '30px', fontSize: '13px', fontWeight: '700', 
              letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase'
            }}>
              Profil Kebun
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: '800', color: '#2c3e50', marginBottom: '15px', lineHeight: '1.2' }}>
              Kenali Saung Tinanggur
            </h2>
            <p style={{ fontSize: '16px', color: '#7f8c8d', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Pusat agrowisata anggur organik dengan teknologi pertanian presisi terdepan di Subang, Jawa Barat.
            </p>
          </header>

          <div className="bento-grid">
            
            {/* CARD 1: Gambar Utama & Kisah */}
            <article className="bento-card span-2" style={{ 
              position: 'relative', 
              minHeight: '350px',
              backgroundImage: 'url("/image.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              justifyContent: 'flex-end',
              padding: '40px'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', marginBottom: '15px' }}>
                  🌱 Sejak 2014
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>Agrowisata & Inovasi</h3>
                <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.9, maxWidth: '500px' }}>
                  Menggabungkan pariwisata alam dengan teknologi fertigasi cerdas. Kami berdedikasi menghasilkan buah anggur berkualitas premium tanpa pestisida kimia berbahaya.
                </p>
              </div>
            </article>

            {/* CARD 2: Statistik Angka Besar */}
            <article className="bento-card" style={{ padding: '30px', justifyContent: 'center', backgroundColor: '#2c3e50', color: 'white' }}>
              <h3 style={{ fontSize: '16px', color: '#bdc3c7', marginBottom: '25px', fontWeight: '600' }}>Skala Operasional</h3>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#2ecc71', lineHeight: '1' }}>5 <span style={{ fontSize: '20px' }}>Hektar</span></div>
                <div style={{ fontSize: '13px', color: '#95a5a6', marginTop: '4px' }}>Luas Area Kebun Aktif</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#3498db', lineHeight: '1' }}>60 <span style={{ fontSize: '20px' }}>Ton</span></div>
                <div style={{ fontSize: '13px', color: '#95a5a6', marginTop: '4px' }}>Kapasitas Produksi Tahunan</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#f1c40f', lineHeight: '1' }}>10+ <span style={{ fontSize: '20px' }}>Tahun</span></div>
                <div style={{ fontSize: '13px', color: '#95a5a6', marginTop: '4px' }}>Pengalaman Agronomi</div>
              </div>
            </article>

            {/* CARD 3: Varietas */}
            <article className="bento-card" style={{ padding: '30px' }}>
              <div style={{ fontSize: '30px', marginBottom: '15px' }}>🍇</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '10px' }}>Varietas Premium</h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6' }}>
                Fokus pada varietas adaptif bernilai tinggi seperti <strong>Jupiter, Excelsa, Flameless,</strong> dan <strong>Istria</strong>.
              </p>
            </article>

            {/* CARD 4: Teknologi */}
            <article className="bento-card" style={{ padding: '30px' }}>
              <div style={{ fontSize: '30px', marginBottom: '15px' }}>⚙️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50', marginBottom: '10px' }}>Smart Farming</h3>
              <p style={{ fontSize: '14px', color: '#7f8c8d', lineHeight: '1.6' }}>
                Terintegrasi penuh dengan <strong>IoT & Artificial Intelligence</strong> untuk mengatur irigasi dan nutrisi otomatis.
              </p>
            </article>

            {/* CARD 5: Sustainability */}
            <article className="bento-card" style={{ padding: '30px', backgroundColor: '#e8f5e9' }}>
              <div style={{ fontSize: '30px', marginBottom: '15px' }}>🌍</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#27ae60', marginBottom: '10px' }}>Keberlanjutan</h3>
              <p style={{ fontSize: '14px', color: '#34495e', lineHeight: '1.6' }}>
                Komitmen kuat pada <strong>pertanian organik</strong>. Menghemat hingga 40% air dan menghilangkan residu kimia.
              </p>
            </article>

            {/* CARD 6: Peta Lokasi FIXED (Span 3 Kolom) */}
            <article className="bento-card span-3" style={{ padding: '20px', flexDirection: 'row', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #eee' }}>
                {/* LOGIKA FIX: Menggunakan URL Embed resmi Google Maps untuk Saung Tinanggur.
                   Link 'share.google' tidak bisa dipakai langsung di iframe.
                */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.364495574042!2d107.6965154!3d-6.6015501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e693b8c34f3e58b%3A0x67de61d61f4d4924!2sSaung%20Tinanggur!5e0!3m2!1sid!2sid!4v1712715000000!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-cross-origin"
                  title="Peta Lokasi Saung Tinanggur"
                ></iframe>
              </div>
              
              <div style={{ flex: '1 1 300px', padding: '10px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📍</span>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#2c3e50', margin: 0 }}>Kunjungi Kami</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#7f8c8d', lineHeight: '1.6', marginBottom: '25px' }}>
                  Desa Cirangrang, Subang, Jawa Barat.<br/> Buka setiap hari untuk wisata edukasi, petik anggur langsung, dan konsultasi teknologi tani.
                </p>
                <a 
                  href="https://share.google/I6P8fHbVzeiB44B2r" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#2c3e50',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2c3e50'}
                >
                  🗺️ Buka di Google Maps
                </a>
              </div>
            </article>

          </div>
        </div>
      </section>

{/* SECTION: Testimonial & News */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f9fafb' }}>
        {/* Style khusus untuk efek hover pada kartu */}
        <style>{`
          .lp-testi-card {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            border: 1px solid #ecf0f1;
            position: relative;
            transition: all 0.3s ease;
          }
          .lp-testi-card:hover {
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            transform: translateY(-4px);
          }
          .lp-news-card {
            display: flex;
            gap: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            border: 1px solid #ecf0f1;
            transition: all 0.3s ease;
            cursor: pointer;
            align-items: flex-start;
          }
          .lp-news-card:hover {
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            border-color: #3498db;
          }
          @media (max-width: 768px) {
            .lp-news-card { flex-direction: column; gap: 12px; }
          }
        `}</style>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '50px' 
        }}>
          
          {/* KOLOM KIRI: TESTIMONI */}
          <div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#e3f2fd', color: '#2980b9', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                💬 Apa Kata Mereka
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#2c3e50', marginBottom: '10px', lineHeight: '1.2' }}>
                Dipercaya oleh Ahli Agronomi
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '15px' }}>
                Pengalaman nyata dari para praktisi yang telah menggunakan Smart Vineyard.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Testimoni 1 */}
              <div className="lp-testi-card">
                <div style={{ fontSize: '60px', color: '#f0f0f0', position: 'absolute', top: '10px', right: '20px', fontFamily: 'serif', lineHeight: '1' }}>❝</div>
                <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                  "Smart Vineyard System benar-benar mengubah cara kami mengelola kebun. Monitoring real-time membantu kami mengoptimalkan jadwal irigasi dan aplikasi nutrisi. Hasilnya, produktivitas meningkat 35% dan kualitas buah lebih konsisten."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                    HW
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#2c3e50' }}>Hendra Wijaya</div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Agronomis, Saung Tinanggur</div>
                  </div>
                </div>
              </div>

              {/* Testimoni 2 */}
              <div className="lp-testi-card">
                <div style={{ fontSize: '60px', color: '#f0f0f0', position: 'absolute', top: '10px', right: '20px', fontFamily: 'serif', lineHeight: '1' }}>❝</div>
                <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                  "Fitur AI Diagnosis sangat membantu mendeteksi penyakit daun lebih awal. Kami bisa mengambil tindakan preventif sebelum penyakit menyebar ke tanaman lain, sehingga mengurangi kerugian hingga 40%."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                    SM
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#2c3e50' }}>Siti Maria</div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Koordinator Lapangan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: NEWS & ARTICLES */}
          <div>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#fce4ec', color: '#c2185b', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                📰 Kabar & Edukasi
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#2c3e50', marginBottom: '10px', lineHeight: '1.2' }}>
                Wawasan Pertanian
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '15px' }}>
                Artikel terbaru seputar teknologi IoT dan agronomi anggur.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Artikel 1 */}
              <article className="lp-news-card">
                <div style={{ minWidth: '70px', height: '70px', borderRadius: '12px', background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>12</span>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px' }}>Okt</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', marginBottom: '6px', lineHeight: '1.4' }}>
                    Optimasi Nutrisi untuk Varietas Jupiter
                  </h3>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                    Tips mengatur threshold kelembapan & nutrisi khusus varietas Jupiter berbasis data presisi sensor.
                  </p>
                </div>
              </article>

              {/* Artikel 2 */}
              <article className="lp-news-card">
                <div style={{ minWidth: '70px', height: '70px', borderRadius: '12px', background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>08</span>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px' }}>Okt</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', marginBottom: '6px', lineHeight: '1.4' }}>
                    Mendeteksi Penyakit Daun Lebih Awal
                  </h3>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                    Bagaimana AI membantu mendeteksi klorosis & nekrosis sebelum gejalanya menyebar di kebun anggur organik.
                  </p>
                </div>
              </article>

              {/* Artikel 3 */}
              <article className="lp-news-card">
                <div style={{ minWidth: '70px', height: '70px', borderRadius: '12px', background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1' }}>29</span>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', marginTop: '2px' }}>Sep</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2c3e50', marginBottom: '6px', lineHeight: '1.4' }}>
                    Sustainability di Saung Tinanggur
                  </h3>
                  <p style={{ fontSize: '13px', color: '#7f8c8d', lineHeight: '1.6', margin: 0 }}>
                    Komitmen kami terhadap pertanian organik berkelanjutan melalui teknologi hemat air dan pengurangan pestisida.
                  </p>
                </div>
              </article>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER RINGKAS */}
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <div className="lp-footer-brand">
            <div className="sidebar-logo">Smart Vineyard</div>
            <div className="sidebar-subtitle">Saung Tinanggur, Subang · Smart Farming</div>
            <div style={{fontSize: '12px', marginTop: '8px', color: '#666'}}>
              Pusat Agrowisata Kebun Anggur Organik dengan Teknologi IoT &amp; AI
            </div>
          </div>
          <div className="lp-footer-links">
            <div>
              <h4>Modul Sistem</h4>
              <ul>
                <li>Monitoring IoT Real-time</li>
                <li>Analisis AI Diagnosis</li>
                <li>Laporan &amp; Prediksi Tren</li>
                <li>Kontrol Manual Otomasi</li>
              </ul>
            </div>
            <div>
              <h4>Kontak &amp; Alamat</h4>
              <ul>
                <li>📧 Email: info@saungtinanggur.com</li>
                <li>📞 Telepon: (0260) xxx-xxxx</li>
                <li>📍 Desa Cirangrang, Subang, Jawa Barat</li>
                <li>🌐 www.saungtinanggur.com</li>
              </ul>
            </div>
            <div>
              <h4>Informasi</h4>
              <ul>
                <li>Luas Lahan: 5 Hektar</li>
                <li>Produksi: 50-60 Ton/Tahun</li>
                <li>Varietas: Jupiter, Excelsa, Flameless</li>
                <li>Sistem: Fertigasi Organik IoT</li>
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

