"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class dalamKota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tempat, {
        foreignKey: "dalamKotaId",
        as: "dalamKota",
      });
      this.belongsTo(models.daftarUnitKerja);
    }
  }
  dalamKota.init(
    {
      nama: DataTypes.STRING,
      uangTransport: DataTypes.INTEGER,
      durasi: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "dalamKota",
    }
  );
  return dalamKota;
};
