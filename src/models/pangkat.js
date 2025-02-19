"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pangkat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.pegawai);
    }
  }
  pangkat.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "pangkat",
    }
  );
  return pangkat;
};
