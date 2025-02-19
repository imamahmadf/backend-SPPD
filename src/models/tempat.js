"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tempat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.perjalanan);
    }
  }
  tempat.init(
    {
      nama: DataTypes.STRING,
      uangTrasnport: DataTypes.INTEGER,
      jenis: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tempat",
    }
  );
  return tempat;
};
