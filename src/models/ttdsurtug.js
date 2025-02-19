"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdSurTug extends Model {
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
  ttdSurTug.init(
    {
      nama: DataTypes.STRING,
      nip: DataTypes.STRING,
      jabatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ttdSurTug",
    }
  );
  return ttdSurTug;
};
