const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VarietasAnggur = sequelize.define('Varietas_Anggur', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  nama_varietas: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },

  // --- Ambang Batas Kelembapan (Moisture) ---
  min_moisture: { type: DataTypes.FLOAT },
  max_moisture: { type: DataTypes.FLOAT },

  // --- Ambang Batas Suhu Tanah ---
  min_suhu: { type: DataTypes.FLOAT },
  max_suhu: { type: DataTypes.FLOAT },

  // --- Ambang Batas pH Tanah ---
  min_ph: { type: DataTypes.FLOAT },
  max_ph: { type: DataTypes.FLOAT },

  // --- Ambang Batas EC (Electrical Conductivity) ---
  min_ec: { type: DataTypes.FLOAT },
  max_ec: { type: DataTypes.FLOAT },

  // --- Ambang Batas Nitrogen (N) ---
  min_n: { type: DataTypes.FLOAT },
  max_n: { type: DataTypes.FLOAT },

  // --- Ambang Batas Fosfor (P) ---
  min_p: { type: DataTypes.FLOAT },
  max_p: { type: DataTypes.FLOAT },

  // --- Ambang Batas Kalium (K) ---
  min_k: { type: DataTypes.FLOAT },
  max_k: { type: DataTypes.FLOAT }

}, { 
  tableName: 'Varietas_Anggur', 
  timestamps: false 
});

module.exports = VarietasAnggur;