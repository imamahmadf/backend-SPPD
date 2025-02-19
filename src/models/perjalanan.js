"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class perjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId1",
        as: "pegawai1",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId2",
        as: "pegawai2",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId3",
        as: "pegawai3",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId4",
        as: "pegawai4",
      });
      this.belongsTo(models.tempat);
      this.belongsTo(models.kodeRekening);
      this.belongsTo(models.tempat);
      this.belongsTo(models.ttdSurTug);
      this.belongsTo(models.ttdNotDis);
    }
  }
  perjalanan.init(
    {
      pegawaiId1: DataTypes.INTEGER,
      pegawaiId2: DataTypes.INTEGER,
      pegawaiId3: DataTypes.INTEGER,
      pegawaiId4: DataTypes.INTEGER,
      ttdSurTugId: DataTypes.INTEGER,
      ttdNotDisId: DataTypes.INTEGER,
      noSurTug: DataTypes.STRING,
      noNotDis: DataTypes.STRING,
      noSpd1: DataTypes.STRING,
      noSpd2: DataTypes.STRING,
      noSpd3: DataTypes.STRING,
      noSpd4: DataTypes.STRING,
      TanggalBerangkat: DataTypes.DATE,
      tanggalPulang: DataTypes.DATE,
      tempatId: DataTypes.INTEGER,
      tujuan: DataTypes.STRING,
      alasan: DataTypes.STRING,
      kodeRekeningId: DataTypes.INTEGER,
      tipe: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "perjalanan",
    }
  );
  return perjalanan;
};
