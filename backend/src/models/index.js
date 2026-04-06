const { sequelize } = require('../config/db');
const User = require('./User');
const VarietasAnggur = require('./VarietasAnggur');
const PerangkatIoT = require('./PerangkatIoT');
const LogSensorTanah = require('./LogSensorTanah');
const LogDiagnosisAI = require('./LogDiagnosisAI');
const LogTandon = require('./LogTandon');
const Notification = require('./Notification');

// User <-> Perangkat
User.hasMany(PerangkatIoT, { foreignKey: 'user_id' });
PerangkatIoT.belongsTo(User, { foreignKey: 'user_id' });

// Varietas <-> Perangkat
VarietasAnggur.hasMany(PerangkatIoT, { foreignKey: 'varietas_id' });
PerangkatIoT.belongsTo(VarietasAnggur, { foreignKey: 'varietas_id' });

// Perangkat <-> Log Sensor
PerangkatIoT.hasMany(LogSensorTanah, { foreignKey: 'perangkat_id' });
LogSensorTanah.belongsTo(PerangkatIoT, { foreignKey: 'perangkat_id' });

// Perangkat <-> Log AI
PerangkatIoT.hasMany(LogDiagnosisAI, { foreignKey: 'perangkat_id' });
LogDiagnosisAI.belongsTo(PerangkatIoT, { foreignKey: 'perangkat_id' });

// Perangkat <-> Log Tandon (TAMBAHKAN INI)
PerangkatIoT.hasMany(LogTandon, { foreignKey: 'perangkat_id' });
LogTandon.belongsTo(PerangkatIoT, { foreignKey: 'perangkat_id' });

// Perangkat <-> Notification (TAMBAHKAN INI)
PerangkatIoT.hasMany(Notification, { foreignKey: 'perangkat_id' });
Notification.belongsTo(PerangkatIoT, { foreignKey: 'perangkat_id' });

module.exports = {
  sequelize,
  User,
  VarietasAnggur,
  PerangkatIoT,
  LogSensorTanah,
  LogDiagnosisAI,
  LogTandon,
  Notification
};