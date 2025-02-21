"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class personil extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.perjalanan);
      this.belongsTo(models.pegawai);
    }
  }
  personil.init(
    {
      pegawaiId: DataTypes.INTEGER,
      perjalananId: DataTypes.INTEGER,
      nomorSPD: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "personil",
    }
  );
  return personil;
};
