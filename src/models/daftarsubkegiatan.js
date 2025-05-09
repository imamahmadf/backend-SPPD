"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarSubKegiatan extends Model {
    static associate(models) {
      this.hasMany(models.perjalanan);
    }
  }
  daftarSubKegiatan.init(
    {
      kodeRekening: DataTypes.STRING,
      subKegiatan: DataTypes.STRING,
      unitKerjaId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarSubKegiatan",
    }
  );
  return daftarSubKegiatan;
};
