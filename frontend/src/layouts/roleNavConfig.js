import { AgronomisPaths, OwnerPaths, StaffPaths } from '../routes/routePaths'

export const roleNavConfig = {
  owner: {
    title: 'Smart Vineyard (Owner)',
    subtitle: 'Saung Tinanggur · Owner Console',
    menuGroups: [
      {
        groupTitle: 'OVERVIEW',
        links: [
          { to: OwnerPaths.dashboard, label: '📊 Dashboard Utama' },
        ]
      },
      {
        groupTitle: 'SETUP & MANAJEMEN',
        links: [
          { to: OwnerPaths.users, label: '👥 Manajemen Pengguna' },
          { to: OwnerPaths.thresholds, label: '🎛️ Konfigurasi Threshold' },

        ]
      },
      {
        groupTitle: 'MONITORING REAL-TIME',
        links: [
          { to: OwnerPaths.sensors, label: '🌱 Monitoring Lahan' },
          { to: OwnerPaths.tanks, label: '💧 Monitoring Tandon' },
        ]
      },
      {
        groupTitle: 'EKSEKUSI & KONTROL',
        links: [
          { to: OwnerPaths.manualControl, label: '⚙️ Kontrol Manual' },
          { to: OwnerPaths.analysis, label: '🤖 Diagnosis AI' },
        ]
      },
      {
        groupTitle: 'EVALUASI & LAPORAN',
        links: [
          { to: OwnerPaths.notifications, label: '⚠️ Notifikasi Kritis' },
          { to: OwnerPaths.trends, label: '📈 Prediksi Tren' },
          { to: OwnerPaths.reports, label: '📄 Ekspor Laporan' },
        ]
      }
    ],
  },
  
  agronomis: {
    title: 'Smart Vineyard (Agronomis)',
    subtitle: 'Saung Tinanggur · Tim Agronomis',
    menuGroups: [
      {
        groupTitle: 'OVERVIEW',
        links: [
          { to: AgronomisPaths.dashboard, label: '📊 Dashboard Agronomi' },
        ]
      },
      {
        groupTitle: 'OBSERVASI DATA',
        links: [
          { to: AgronomisPaths.monitoring, label: '🌱 Monitoring Lahan' },
          { to: AgronomisPaths.sensors, label: '📋 Riwayat Sensor' }, 
        ]
      },
      {
        groupTitle: 'ANALISIS & KEPUTUSAN',
        links: [
          { to: AgronomisPaths.recommendation, label: '💡 Rekomendasi Sistem' },
          { to: AgronomisPaths.history, label: '📈 Analisis Tren' },
          // Catatan: Pastikan kamu menambahkan AgronomisPaths.notifications di file routePaths kamu
          // karena sebelumnya memanggil AgronomisPaths.sensors yang berakibat duplikat
          { to: AgronomisPaths.notifications || AgronomisPaths.dashboard, label: '⚠️ Notifikasi Kritis' }, 
        ]
      }
    ],
  },
  
  staff: {
    title: 'Smart Vineyard (Staff)',
    subtitle: 'Saung Tinanggur · Staff Lapangan',
    menuGroups: [
      {
        groupTitle: 'OVERVIEW',
        links: [
          { to: StaffPaths.dashboard, label: '📊 Ringkasan Tugas' },
        ]
      },
      {
        groupTitle: 'TUGAS LAPANGAN',
        links: [
          { to: StaffPaths.sensors, label: '🌱 Status Lahan' },
        ]
      }
    ],
  },
}