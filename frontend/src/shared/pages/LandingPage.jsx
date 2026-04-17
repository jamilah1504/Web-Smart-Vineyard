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
      {/* PREMIUM HEADER */}
      <header style={{
        background: 'linear-gradient(135deg, #1e5a3a 0%, #2c5f2d 50%, #1a472e 100%)',
        padding: '0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        marginBottom: '0'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          fontSize: '11px',
          color: '#e8e8e8',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          <div style={{ display: 'flex', gap: '25px' }}>
            <a href="#" style={{ color: '#e8e8e8', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#FFD700'} onMouseLeave={(e) => e.target.style.color = '#e8e8e8'}>FAQ</a>
            <a href="#" style={{ color: '#e8e8e8', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#FFD700'} onMouseLeave={(e) => e.target.style.color = '#e8e8e8'}>WEBMAIL</a>
            <a href="#" style={{ color: '#e8e8e8', textDecoration: 'none', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#FFD700'} onMouseLeave={(e) => e.target.style.color = '#e8e8e8'}>PETA SITUS</a>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: '#e8e8e8', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#FFD700'; }} onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#e8e8e8'; }}>🇮🇩 ID</button>
            <span style={{ opacity: '0.5' }}>|</span>
            <button style={{ background: 'none', border: 'none', color: '#e8e8e8', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#FFD700'; }} onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = '#e8e8e8'; }}>🇬🇧 EN</button>
          </div>
        </div>

        {/* Main Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 40px',
          gap: '20px'
        }}>
          {/* Logo & Brand + Search (Kiri) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: 'fit-content',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div style={{
                fontSize: '28px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))'
              }}>
                🌱
              </div>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.3px' }}>Smart Vineyard</div>
                <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '1px' }}>Saung Tinanggur</div>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '28px',
              padding: '8px 16px',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'}
            >
              <span style={{ fontSize: '16px', opacity: 0.6 }}>🔍</span>
              <input 
                type="text" 
                placeholder="Cari fitur..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  width: '120px'
                }}
              />
            </div>
          </div>

          {/* Navigation Menu + Login (Kanan) */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.5px'
          }}>
            <a href="javascript:void(0)" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ 
              color: '#FFD700', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
              BERANDA
            </a>
            <a href="#features" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FFD700';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#fff';
            }}
            >
              FITUR
            </a>
            <a href="#sma-video-section" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.preventDefault();
              const videoSection = document.getElementById('sma-video-section');
              if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FFD700';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#fff';
            }}
            >
              VIDEO
            </a>
            <a href="#lp-section" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.preventDefault();
              const section = document.querySelector('.lp-section');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FFD700';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#fff';
            }}
            >
              TENTANG KAMI
            </a>
            <a href="#footer" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.preventDefault();
              const footer = document.querySelector('.lp-footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#FFD700';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#fff';
            }}
            >
              KONTAK
            </a>

            {/* CTA Button */}
            <Link 
              to={PublicPaths.login}
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#2c5f2d',
                padding: '9px 24px',
                borderRadius: '25px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                display: 'inline-block',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
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
              Masuk
            </Link>
          </nav>
        </div>
      </header>

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
              href="/manual-book.pdf"
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

      {/* SECTION: Tentang Saung Tinanggur */}
      <section className="lp-section">
        <header className="lp-section-header">
          <h2 className="lp-section-title">Tentang Saung Tinanggur Subang</h2>
          <p className="lp-section-subtitle">
            Pusat agrowisata kebun anggur organik dengan teknologi pertanian terdepan di Jawa Barat
          </p>
        </header>
        <div className="lp-vineyard-grid">
          <div className="lp-vineyard-card">
            <h3>📍 Lokasi Strategis</h3>
            <p>
              Desa Cirangrang, Subang, Jawa Barat. Saung Tinanggur terletak dengan akses mudah dari 
              pusat Kota Subang, menjadikannya destinasi agrowisata favorit bagi penggemar anggur organik.
            </p>
          </div>
          <div className="lp-vineyard-card">
            <h3>🍇 Varietas Unggulan</h3>
            <p>
              Menanam varietas anggur premium: Jupiter, Excelsa, Flameless, dan Istria. Setiap varietas 
              dipilih berdasarkan adaptabilitas iklim Subang dan preferensi pasar lokal serta ekspor.
            </p>
          </div>
          <div className="lp-vineyard-card">
            <h3>🌱 Sistem Fertigasi</h3>
            <p>
              Menggunakan sistem fertigasi otomatis dengan kontrol presisi kelembapan tanah dan nutrisi. 
              Setiap tanaman mendapat kebutuhan air dan nutrisi optimal sepanjang musim.
            </p>
          </div>
          <div className="lp-vineyard-card">
            <h3>👥 Tim Ahli Berpengalaman</h3>
            <p>
              Tim agronomis berpengalaman lebih dari 10 tahun dalam budidaya anggur organik. Terus 
              berinovasi menerapkan standar internasional untuk menghasilkan buah berkualitas terbaik.
            </p>
          </div>
          <div className="lp-vineyard-card">
            <h3>📊 Produksi Tahunan</h3>
            <p>
              Dengan luas lahan 5 hektar, memproduksi hingga 50-60 ton anggur segar per tahun. Produksi 
              didistribusikan ke pasar modern, restoran, dan langsung ke konsumen melalui wisata agro.
            </p>
          </div>
          <div className="lp-vineyard-card">
            <h3>🏆 Komitmen Sustainability</h3>
            <p>
              Komitmen terhadap pertanian organik berkelanjutan melalui teknologi hemat air dan 
              pengurangan penggunaan pestisida kimia untuk hasil panen yang sehat dan ramah lingkungan.
            </p>
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

