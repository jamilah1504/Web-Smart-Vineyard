// Memanggil folder models otomatis akan membaca file index.js di dalamnya
const { sequelize } = require('./src/models'); 

console.log('Memulai sinkronisasi database...');

sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('✅ Database berhasil disinkronisasi sesuai ERD!');
    process.exit(0); 
  })
  .catch((err) => {
    console.error('❌ Gagal sinkronisasi database:', err);
    process.exit(1); 
  });