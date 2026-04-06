const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  perangkat_id: { type: DataTypes.STRING },
  pesan: { type: DataTypes.STRING },
  tipe: { type: DataTypes.ENUM('info', 'warning', 'critical'), defaultValue: 'info' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'Notifications' });

module.exports = Notification;