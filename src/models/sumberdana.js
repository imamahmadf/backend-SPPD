"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sumberDana extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.bendahara, {
        foreignKey: "sumberDanaId",
      });
    }
  }
  sumberDana.init(
    {
      sumber: DataTypes.STRING,
      untukPembayaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "sumberDana",
    }
  );
  return sumberDana;
};
