const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LogSensorTanah = sequelize.define('Log_Sensor_Tanah', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  perangkat_id: { type: DataTypes.STRING, allowNull: false }, 
  n_val: { type: DataTypes.FLOAT },
  p_val: { type: DataTypes.FLOAT },
  k_val: { type: DataTypes.FLOAT },
  ph_val: { type: DataTypes.FLOAT },
  suhu_val: { type: DataTypes.FLOAT },
  ec_val: { type: DataTypes.FLOAT },
  kelembapan_val: { type: DataTypes.FLOAT }, // <-- SUDAH DIGANTI
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Log_Sensor_Tanah', timestamps: false });

module.exports = LogSensorTanah;