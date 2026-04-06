const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LogDiagnosisAI = sequelize.define('Log_Diagnosis_AI', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  perangkat_id: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: true },
  hasil_diagnosis: { type: DataTypes.STRING, allowNull: false }, // KOLOM INI HARUS ADA
  confidence_score: { type: DataTypes.FLOAT },
  saran_tindakan: { type: DataTypes.TEXT, allowNull: true } // KOLOM INI HARUS ADA
}, { 
  tableName: 'Log_Diagnosis_AI', 
  timestamps: true 
});

module.exports = LogDiagnosisAI;