// src/models/User.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    role: {
      type: DataTypes.ENUM("Owner", "Agronomis", "Staff"),
      defaultValue: "Staff",
      allowNull: true,
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: true, // Biarkan jika nanti mau pakai Push Notification Firebase
    }
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Method untuk mengecek kecocokan password saat login
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = User;