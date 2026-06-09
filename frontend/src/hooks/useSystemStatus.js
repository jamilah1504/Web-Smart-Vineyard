import { useState, useEffect } from 'react'
import { getAllDevices } from '../services/controlApi'

export function useSystemStatus(pollIntervalMs = 15000) {
  const [status, setStatus] = useState({
    level: 'loading',
    label: 'Memeriksa...',
    onlineCount: 0,
    totalCount: 0,
  })

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const response = await getAllDevices()
        if (cancelled) return

        const devices = response?.data || []

        if (devices.length === 0) {
          setStatus({ level: 'unknown', label: 'Tidak Ada Perangkat', onlineCount: 0, totalCount: 0 })
          return
        }

        const onlineCount = devices.filter((d) => d.status_koneksi === 'Online').length
        const totalCount = devices.length

        if (onlineCount === totalCount) {
          setStatus({ level: 'online', label: 'System Online', onlineCount, totalCount })
        } else if (onlineCount === 0) {
          setStatus({ level: 'offline', label: 'System Offline', onlineCount, totalCount })
        } else {
          setStatus({
            level: 'partial',
            label: `Sebagian Offline (${onlineCount}/${totalCount})`,
            onlineCount,
            totalCount,
          })
        }
      } catch {
        if (!cancelled) {
          setStatus({ level: 'error', label: 'Tidak Terhubung', onlineCount: 0, totalCount: 0 })
        }
      }
    }

    check()
    const interval = setInterval(check, pollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollIntervalMs])

  return status
}
