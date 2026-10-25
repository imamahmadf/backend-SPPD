"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class suratPengantar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kendaraan);
      this.belongsTo(models.user);
      this.belongsTo(models.pegawai, {
        foreignKey: "penandatanganId",
        as: "penandatangan",
      });
    }
  }
  suratPengantar.init(
    {
      kendaraanId: DataTypes.INTEGER,
      noLoket: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      penandatanganId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "suratPengantar",
    }
  );
  return suratPengantar;
};
