const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LogTandon = sequelize.define('Log_Tandon', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  perangkat_id: { type: DataTypes.STRING, allowNull: false }, 
  jenis_tandon: { type: DataTypes.ENUM('air', 'pupuk'), allowNull: false },
  ketinggian_air: { type: DataTypes.FLOAT }, 
  volume_liter: { type: DataTypes.FLOAT },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Log_Tandon', timestamps: false });

module.exports = LogTandon;