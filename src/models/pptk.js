"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PPTK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.daftarKegiatan);
    }
  }
  PPTK.init(
    {
      nama: DataTypes.STRING,
      nip: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      pangkat: DataTypes.STRING,
      golongan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PPTK",
    }
  );
  return PPTK;
};
