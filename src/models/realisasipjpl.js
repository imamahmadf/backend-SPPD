"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class realisasiPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kinerjaPJPL, {
        foreignKey: "kinerjaPJPLId",
        as: "kinerjaPJPL",
      });
      this.hasMany(models.hasilKerjaPJPL, {
        foreignKey: "realisasiPJPLId",
        as: "hasilKerjaPJPLs",
      });
    }
  }
  realisasiPJPL.init(
    {
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
      status: DataTypes.ENUM("diajukan", "ditolak", "diterima"),
      kinerjaPJPLId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "realisasiPJPL",
    }
  );
  return realisasiPJPL;
};
