const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LogDiagnosisAI = sequelize.define('Log_Diagnosis_AI', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  perangkat_id: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: true },
  hasil_diagnosis: { type: DataTypes.STRING, allowNull: false },
  confidence_score: { type: DataTypes.FLOAT },
  saran_tindakan: { type: DataTypes.TEXT, allowNull: true }
}, { 
  tableName: 'Log_Diagnosis_AI', 
  timestamps: true 
});

module.exports = LogDiagnosisAI;

module.exports = LogDiagnosisAI;