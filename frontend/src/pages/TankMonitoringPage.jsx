import { useMemo, useState, useEffect, useCallback } from 'react'
import { getLatestWaterLevel } from '../services/controlApi'

const DEVICE_ID = "ESP32-MAC-A001"; // ID Perangkat

function TankMonitoringPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tank, setTank] = useState('all')
  const [tankData, setTankData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // === FUNGSI TARIK DATA ===
  const fetchTankData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await getLatestWaterLevel(DEVICE_ID);
    
    console.log("Cek Data Tandon Asli:", response.data);

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const transformed = response.data.map(item => {
        // Ambil jarak sensor ke air (misal sensor baca 10cm, berarti air sisa 32cm)
        const jarakSensor = parseFloat(item.ketinggian_air) || 0;
        const TINGGI_MAKSIMAL_TANDON = 42; 

        // Rumus: Sisa Air = Tinggi Tandon - Jarak Bacaan Sensor
        const tinggiAirAsli = TINGGI_MAKSIMAL_TANDON - jarakSensor;
        let persentase = Math.round((tinggiAirAsli / TINGGI_MAKSIMAL_TANDON) * 100);
        
        // Safety guard agar tidak lewat batas 0-100
        persentase = Math.max(0, Math.min(100, persentase));

        return {
          time: new Date(item.timestamp).toLocaleString('id-ID'),
          tank: 'Tandon Air Baku',
          level: persentase,
          status: determinateStatus(persentase)
        };
      });

      setTankData(transformed);
      setError('');
    }
  } catch (err) {
    setError("Gagal koneksi ke server tandon.");
  } finally {
    setLoading(false);
  }
}, []);

  // === TRIGGER: AUTO REFRESH ===
  useEffect(() => {
    fetchTankData()
    const intervalId = setInterval(fetchTankData, 15000)
    return () => clearInterval(intervalId)
  }, [fetchTankData])

  // Helper function untuk tentukan status
const determinateStatus = (level) => {
  if (level >= 60) return 'normal';    // Di atas 60% Aman
  if (level >= 25) return 'warning';   // 25% - 59% Siaga
  return 'critical';                   // Di bawah 25% Kritis
}

  const filtered = useMemo(() => {
    return tankData.filter((row) => {
      const d = row.time.split(' ')[0].split('-').reverse().join('-')
      const matchesFrom = !dateFrom || d >= dateFrom
      const matchesTo = !dateTo || d <= dateTo
      const matchesTank = tank === 'all' || row.tank === tank
      return matchesFrom && matchesTo && matchesTank
    })
  }, [dateFrom, dateTo, tank, tankData])

const latest = filtered.length > 0 ? filtered[0] : null

  return (
    <div className="page page-with-padding page-shell" style={{ backgroundColor: '#f8f9fa' }}>
      {error && (
        <div className="alert alert-danger u-mb-15">
          <strong>Peringatan:</strong> {error}
        </div>
      )}
      
      <div className="page-header u-mb-15">
        <div>
          <div className="page-title page-title-lg">💧 Monitoring Tandon</div>
          <div className="page-caption page-caption-lg">
            Pantau persentase stok air dan nutrisi di tandon utama untuk mencegah dry-run pompa.
          </div>
        </div>
      </div>

      <section className="card-grid-3 u-mb-1">
        <div className="card card-animate card-animate-delay-1 card-elevated card-stretch">
          <div className="card-header card-header-top-md">
            <div>
              <div className="card-title card-title-lg">Filter Data</div>
              <div className="card-subtitle card-subtitle-lg">
                Pilih rentang tanggal & tandon yang ingin dipantau
              </div>
            </div>
          </div>
          <div className="simple-card-list form-grid-2 u-mt-05">
            <div>
              <div className="small-text text-sm-muted">Tanggal Mulai</div>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <div className="small-text text-sm-muted">Tanggal Akhir</div>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <div className="small-text text-sm-muted">Tandon</div>
              <select className="form-control" value={tank} onChange={(e) => setTank(e.target.value)}>
                <option value="all">Semua Tandon</option>
                <option value="Tandon Air Baku">Tandon Air Baku</option>
              </select>
              </div>
          </div>
          <div className="btn-row u-mt-075">
            <button type="button" className="btn-primary btn-pill-primary">
              Terapkan Filter
            </button>
            <button
              type="button"
              className="btn-pill-outline"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setTank('all')
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card card-animate card-animate-delay-2 card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Snapshot Tandon</div>
              <div className="card-subtitle card-subtitle-lg">
                Kondisi stok terkini dari pembacaan sensor ultrasonik
              </div>
            </div>
          </div>
          <div className="simple-card-list u-mt-05">
            {loading ? (
              <div className="text-center text-muted">
                <p>Memuat data...</p>
              </div>
            ) : latest ? (
              <>
                <div className="small-stat">
                  <div className="small-text text-sm-muted">Nama Tandon</div>
                  <div className="big-number">{latest.tank}</div>
                </div>
                <div className="small-stat">
                  <div className="small-text text-sm-muted">Level Isi</div>
                  <div className="big-number">{latest.level}%</div>
                  <div className="small-text text-sm-muted">Persentase volume terhadap kapasitas</div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted">
                <p>Tidak ada data tersedia</p>
              </div>
            )}
          </div>
        </div>

        <div className="card card-animate card-animate-delay-3 card-elevated">
          <div className="card-header card-header-top">
            <div>
              <div className="card-title card-title-lg">Status Keamanan</div>
              <div className="card-subtitle card-subtitle-lg">
                Ringkasan resiko dry-run & pengisian ulang tandon
              </div>
            </div>
          </div>
          <div className="status-list u-mt-05">
            <div className="status-row">
              <span className="status-label">Auto-Cutoff</span>
              <span className="chip chip-success">
                <span className="chip-dot" />
                Aktif · Pompa aman dari dry-run
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Ambang Peringatan</span>
              <span className="chip chip-neutral">
                <span className="chip-dot" />
                <strong>30%</strong> · Kirim notifikasi ke Telegram
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="card card-animate card-animate-delay-4 card-elevated">
        <div className="card-header card-header-top">
          <div>
            <div className="card-title card-title-lg">Riwayat Level Tandon</div>
            <div className="card-subtitle card-subtitle-lg">
              Data mentah hasil pembacaan sensor ultrasonik JSN-SR04T
            </div>
          </div>
        </div>
        <div className="table-wrapper u-mt-05">
          {loading ? (
            <div className="text-center text-muted" style={{ padding: '2rem' }}>
              <p>Memuat data riwayat...</p>
            </div>
          ) : filtered.length > 0 ? (
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Nama Tandon</th>
                  <th>Level (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={`${row.time}-${row.tank}`}>
                    <td>{row.time}</td>
                    <td>{row.tank}</td>
                    <td>{row.level}</td>
                    <td>
                      {row.status === 'critical'
                        ? 'Kritis · Segera isi ulang'
                        : row.status === 'warning'
                        ? 'Warning · Siapkan pengisian'
                        : 'Normal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-muted" style={{ padding: '2rem' }}>
              <p>Tidak ada data yang sesuai dengan filter</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default TankMonitoringPage