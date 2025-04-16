"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bendahara extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan);
      this.belongsTo(models.daftarUnitKerja);
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai_bendahara",
      });
    }
  }
  bendahara.init(
    {
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "bendahara",
    }
  );
  return bendahara;
};
