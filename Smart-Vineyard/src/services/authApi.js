// Direkomendasikan membuat variabel BASE_URL agar mudah diubah nanti saat di-hosting
const BASE_URL = 'http://localhost:5000';

export async function loginRequest({ email, password }) {
  // Tambahkan BASE_URL di depan endpoint-nya
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // Menangkap error berupa JSON dari backend jika ada (misal: "Email atau password salah")
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Login failed (${res.status})`);
  }

  return await res.json();
}

export async function registerRequest({ nama_lengkap, email, password, role }) {
  // Pastikan di sini juga pakai ${BASE_URL}
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama_lengkap, email, password, role }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || `Registrasi gagal (${res.status})`)
  }

  return await res.json()
}