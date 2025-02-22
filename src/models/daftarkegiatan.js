"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarKegiatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.daftarSubKegiatan);
      this.belongsTo(models.PPTK);
      this.hasMany(models.perjalanan);
    }
  }
  daftarKegiatan.init(
    {
      kodeRekening: DataTypes.STRING,
      kegiatan: DataTypes.STRING,
      subKegiatanId: DataTypes.INTEGER,
      PPTKId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "daftarKegiatan",
    }
  );
  return daftarKegiatan;
};
