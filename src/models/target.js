"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class target extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.indikator);
      this.hasMany(models.tahunAnggaran);
      this.hasMany(models.capaian);
    }
  }
  target.init(
    {
      target: DataTypes.STRING,
      nilai: DataTypes.BIGINT,
      indikatorId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "target",
    }
  );
  return target;
};
