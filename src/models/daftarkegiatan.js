"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarKegiatan extends Model {
    static associate(models) {
      this.hasMany(models.daftarSubKegiatan, {
        foreignKey: "kegiatanId",
        as: "subKegiatan",
      });

      // this.belongsTo(models.PPTK, { foreignKey: "PPTKId" });
    }
  }
  daftarKegiatan.init(
    {
      kodeRekening: DataTypes.STRING,
      kegiatan: DataTypes.STRING,
      sumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarKegiatan",
    }
  );
  return daftarKegiatan;
};
