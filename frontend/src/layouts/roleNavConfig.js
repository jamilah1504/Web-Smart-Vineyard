import { AgronomisPaths, OwnerPaths, StaffPaths } from '../routes/routePaths'

export const roleNavConfig = {
  owner: {
    title: 'Smart Vineyard (Owner)',
    subtitle: 'Saung Tinanggur · Owner Console',
    links: [
      { to: OwnerPaths.dashboard, label: '📊 Dashboard' },
      { to: OwnerPaths.analysis, label: '📈 Analisis AI' },
      { to: OwnerPaths.sensors, label: '💧 Monitoring Lahan' },
      { to: OwnerPaths.tanks, label: '🏗️ Monitoring Tandon' },
      { to: OwnerPaths.analysis, label: '🔍 Diagnosis Penyakit' },
      { to: OwnerPaths.manualControl, label: '⚙️ Kontrol Manual' },
      { to: OwnerPaths.thresholds, label: '⚙️ Konfigurasi Threshold' },
      { to: OwnerPaths.reports, label: '📄 Ekspor Laporan' },
      { to: OwnerPaths.trends, label: '📈 Prediksi Tren' },
      { to: OwnerPaths.notifications, label: '🔔 Notifikasi Bahaya' },
      { to: OwnerPaths.users, label: '👥 Management Pengguna' },
    ],
  },
  agronomis: {
    title: 'Smart Vineyard (Agronomis)',
    subtitle: 'Saung Tinanggur · Agronomis',
    links: [
      { to: AgronomisPaths.dashboard, label: '📊 Dashboard' },
      { to: AgronomisPaths.monitoring, label: '💧 Monitoring Lahan' },
      { to: AgronomisPaths.analysis, label: '🔍 Diagnosis Penyakit' },
      { to: AgronomisPaths.recommendation, label: '💡 Rekomendasi' },
      { to: AgronomisPaths.sensors, label: '📋 Data Sensor' },
      { to: AgronomisPaths.history, label: '📈 Prediksi Tren' },
      { to: AgronomisPaths.sensors, label: '🔔 Notifikasi Bahaya' },
    ],
  },
  staff: {
    title: 'Smart Vineyard (Staff)',
    subtitle: 'Saung Tinanggur · Staff Lapangan',
    links: [
      { to: StaffPaths.dashboard, label: '📊 Dashboard' },
      { to: StaffPaths.sensors, label: '💧 Monitoring Lahan' },
      { to: StaffPaths.uploadImage, label: '🔍 Diagnosis Penyakit' },
    ],
  },
}

