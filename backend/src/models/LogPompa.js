const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LogPompa = sequelize.define('Log_Pompa', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  perangkat_id: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  jenis_pompa: { 
    type: DataTypes.ENUM('air', 'pupuk'),
    allowNull: false
  },
  status: { 
    type: DataTypes.ENUM('NYALA', 'MATI'),
    allowNull: false
  },
  mode_trigger: { 
    type: DataTypes.STRING, // Menyimpan 'auto' atau 'manual'
  }
}, {
  tableName: 'Log_Pompa',
  timestamps: true
});

module.exports = LogPompa;