const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VarietasAnggur = sequelize.define('Varietas_Anggur', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nama_varietas: { type: DataTypes.STRING, allowNull: false },
  min_n: { type: DataTypes.FLOAT },
  min_p: { type: DataTypes.FLOAT },
  min_k: { type: DataTypes.FLOAT },
  min_ph: { type: DataTypes.FLOAT },
  max_ph: { type: DataTypes.FLOAT },
  min_moisture: { type: DataTypes.FLOAT }
}, { tableName: 'Varietas_Anggur', timestamps: false });

module.exports = VarietasAnggur;