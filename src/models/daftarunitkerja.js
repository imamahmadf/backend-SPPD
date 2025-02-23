"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "unitKerjaId",
        as: "daftarUnitKerja",
      });
    }
  }
  daftarUnitKerja.init(
    {
      unitKerja: DataTypes.STRING,
      kode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarUnitKerja",
    }
  );
  return daftarUnitKerja;
};
