"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdNotaDinas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ttdNotaDinas.init(
    {
      nama: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      nip: DataTypes.STRING,
      pangkat: DataTypes.STRING,
      golongan: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ttdNotaDinas",
    }
  );
  return ttdNotaDinas;
};
