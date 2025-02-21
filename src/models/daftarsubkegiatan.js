"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarSubKegiatan extends Model {
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
  daftarSubKegiatan.init(
    {
      kedeRekening: DataTypes.STRING,
      subKegiatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarSubKegiatan",
    }
  );
  return daftarSubKegiatan;
};
