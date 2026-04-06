import { useMemo, useState, useEffect } from 'react';
import * as userApi from '../services/userApi';

const ROLE_LABEL = {
  owner: 'Owner',
  agronomis: 'Agronomis',
  staff: 'Staff',
};

export default function OwnerUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', status: 'active', password: '' });

  // --- 1. LOAD DATA DARI DB ---
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      if (res.status === 'success') {
        // PENTING: Mapping nama_lengkap ke name agar tampil di UI
        const normalizedData = res.data.map(u => ({
          id: u.id,
          name: u.nama_lengkap, // Mapping dari field DB
          email: u.email,
          role: u.role ? u.role.toLowerCase() : 'staff',
          status: u.status || 'active'
        }));
        setUsers(normalizedData);
      }
    } catch (err) {
      alert("Gagal mengambil data user: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LOGIKA FILTER ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).includes(q);
      const matchesRole = role === 'all' ? true : u.role === role;
      const matchesStatus = status === 'all' ? true : u.status === status;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, query, role, status]);

  // --- ACTION HANDLERS ---
  const startCreate = () => {
    setEditingId('new');
    setForm({ name: '', email: '', role: 'staff', status: 'active', password: '' });
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status, password: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: 'staff', status: 'active', password: '' });
  };

  const save = async () => {
    if (!form.name || !form.email) return alert("Nama dan Email wajib diisi");

    try {
      const payload = {
        nama_lengkap: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined 
      };

      if (editingId === 'new') {
        if (!form.password) return alert("Password wajib untuk user baru");
        await userApi.createUser(payload);
      } else {
        await userApi.updateUser(editingId, payload);
      }
      
      loadData(); // Refresh list
      cancelEdit();
    } catch (err) {
      alert("Simpan gagal: " + (err.message || "Terjadi kesalahan"));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus pengguna ini?")) return;
    try {
      await userApi.deleteUser(id);
      loadData();
    } catch (err) {
      alert("Gagal hapus: " + (err.message || err));
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #ecf0f1', 
          borderTop: '4px solid #27ae60',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#7f8c8d' }}>Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .card-responsive {
          animation: slideIn 0.5s ease-out;
          transition: all 0.3s ease;
        }
        .card-responsive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px', color: '#2c3e50' }}>
          👥 Manajemen Pengguna
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>
          Total {users.length} pengguna terdaftar dalam sistem
        </p>
      </div>

      {/* STATS CARDS */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
          animation: 'slideIn 0.5s ease-out'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Total Pengguna</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{users.length}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
          animation: 'slideIn 0.5s ease-out 0.1s both'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Aktif</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{users.filter(u => u.status === 'active').length}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          borderRadius: '15px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
          animation: 'slideIn 0.5s ease-out 0.2s both'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Nonaktif</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{users.filter(u => u.status === 'disabled').length}</div>
        </div>
      </section>

      {/* FILTER & SEARCH SECTION */}
      <section style={{
        background: 'white',
        borderRadius: '15px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: '1px solid #ecf0f1'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '8px' }}>
            🔍 Cari Pengguna
          </label>
          <input
            type="text"
            placeholder="Nama, email, atau ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #ecf0f1',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
              Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                backgroundColor: 'white'
              }}
            >
              <option value="all">Semua Role</option>
              <option value="owner">Owner</option>
              <option value="agronomis">Agronomis</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #ecf0f1',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                backgroundColor: 'white'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="disabled">Nonaktif</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={startCreate}
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#229954'}
              onMouseOut={e => e.target.style.backgroundColor = '#27ae60'}
            >
              ➕ Tambah Pengguna
            </button>
          </div>
        </div>
      </section>

      {/* FORM EDIT/TAMBAH */}
      {editingId && (
        <section style={{
          background: 'white',
          borderRadius: '15px',
          padding: '24px',
          marginBottom: '30px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          border: '2px solid #27ae60',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #ecf0f1'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
              {editingId === 'new' ? '🆕 Tambah Pengguna Baru' : '✏️ Edit Pengguna'}
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={cancelEdit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#bdc3c7'}
                onMouseOut={e => e.target.style.backgroundColor = '#ecf0f1'}
              >
                Batal
              </button>
              <button
                onClick={save}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#229954'}
                onMouseOut={e => e.target.style.backgroundColor = '#27ae60'}
              >
                💾 Simpan
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                Nama Lengkap *
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                Email *
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                Role
              </label>
              <select
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="staff">Staff</option>
                <option value="agronomis">Agronomis</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="active">Aktif</option>
                <option value="disabled">Nonaktif</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', display: 'block', marginBottom: '6px' }}>
                {editingId === 'new' ? 'Password *' : 'Password (Kosongkan jika tidak diubah)'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ecf0f1',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* USER LIST */}
      <section>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '16px' }}>
          📋 Daftar Pengguna ({filtered.length})
        </h3>

        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))',
            gap: '16px'
          }}>
            {filtered.map((u, idx) => (
              <div
                key={u.id}
                className="card-responsive"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #ecf0f1',
                  animation: `slideIn 0.5s ease-out ${idx * 0.05}s both`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: 0,
                        wordBreak: 'break-word'
                      }}>
                        {u.name}
                      </h4>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: u.role === 'owner' ? '#fef3c7' : u.role === 'agronomis' ? '#dbeafe' : '#e0f2fe',
                        color: u.role === 'owner' ? '#92400e' : u.role === 'agronomis' ? '#1e40af' : '#0369a1'
                      }}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: u.status === 'active' ? '#166534' : '#991b1b'
                      }}>
                        {u.status === 'active' ? '● Aktif' : '● Nonaktif'}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#7f8c8d',
                      margin: 0,
                      wordBreak: 'break-word'
                    }}>
                      📧 {u.email}
                    </p>
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#95a5a6',
                      margin: '4px 0 0 0'
                    }}>
                      ID: {u.id}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => startEdit(u)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#2980b9'}
                      onMouseOut={e => e.target.style.backgroundColor = '#3498db'}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => remove(u.id)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#c0392b'}
                      onMouseOut={e => e.target.style.backgroundColor = '#e74c3c'}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #ecf0f1'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#7f8c8d', fontSize: '1rem', margin: 0 }}>
              Data pengguna tidak ditemukan
            </p>
            <p style={{ color: '#95a5a6', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Coba ubah filter atau tambah pengguna baru
            </p>
          </div>
        )}
      </section>
    </div>
  );
}