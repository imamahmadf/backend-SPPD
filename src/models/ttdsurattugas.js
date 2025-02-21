"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdSuratTugas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan);
    }
  }
  ttdSuratTugas.init(
    {
      nama: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      nip: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ttdSuratTugas",
    }
  );
  return ttdSuratTugas;
};
