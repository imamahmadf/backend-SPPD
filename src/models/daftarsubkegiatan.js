"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarSubKegiatan extends Model {
    static associate(models) {
      this.belongsTo(models.daftarKegiatan, {
        foreignKey: "kegiatanId",
        as: "kegiatan",
      });
      this.hasMany(models.perjalanan);
    }
  }
  daftarSubKegiatan.init(
    {
      kodeRekening: DataTypes.STRING,
      subKegiatan: DataTypes.STRING,
      kegiatanId: DataTypes.INTEGER, // Tambahkan kegiatanId
    },
    {
      sequelize,
      modelName: "daftarSubKegiatan",
    }
  );
  return daftarSubKegiatan;
};
