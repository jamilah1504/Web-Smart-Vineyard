const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Notification = require('./Notification');

const PerangkatIoT = sequelize.define('Perangkat_IoT', {
  id: { type: DataTypes.STRING, primaryKey: true }, 
  nama_node: { type: DataTypes.STRING },
  lokasi_blok: { type: DataTypes.STRING },
  status_koneksi: { type: DataTypes.STRING },
  
  // Tambahkan user_id agar relasi di index.js sinkron
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },

  varietas_id: { 
    type: DataTypes.UUID, 
    allowNull: true,
    references: { model: 'Varietas_Anggur', key: 'id' }
  },

  status_pompa_air: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false // false = OFF, true = ON
  },

  status_pompa_pupuk: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false // false = OFF, true = ON
  },

  mode_kerja: { 
    type: DataTypes.ENUM('auto', 'manual'), 
    defaultValue: 'auto' 
  }
}, {
  tableName: 'Perangkat_IoT',
  timestamps: false,
  // --- TRIGGER OTOMATIS (HOOKS) ---
  hooks: {
    afterUpdate: async (perangkat, options) => {
      // Cek apakah status_pompa_air berubah
      if (perangkat.changed('status_pompa_air')) {
        const status = perangkat.status_pompa_air ? 'NYALA' : 'MATI';
        const mode = perangkat.mode_kerja.toUpperCase();
        
        await Notification.create({
          perangkat_id: perangkat.id,
          pesan: `Pompa Air di ${perangkat.nama_node} telah ${status} (Mode: ${mode})`,
          tipe: 'info'
        });
        console.log(`🔔 Notifikasi otomatis dibuat: Pompa ${status}`);
      }
    }
  }
});

module.exports = PerangkatIoT;