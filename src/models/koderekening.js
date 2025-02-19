"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kodeRekening extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.perjalanan);
    }
  }
  kodeRekening.init(
    {
      kode: DataTypes.STRING,
      kegiatan: DataTypes.STRING,
      subKegiatan: DataTypes.STRING,
      sumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kodeRekening",
    }
  );
  return kodeRekening;
};
