"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class indikator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.subKegPer);
      this.belongsTo(models.satuanIndikator);
      this.hasMany(models.target);

      this.belongsTo(models.kegiatan);
      this.belongsTo(models.program);
    }
  }
  indikator.init(
    {
      indikator: DataTypes.STRING,
      satuanIndikatorId: DataTypes.INTEGER,
      subKegPerId: DataTypes.INTEGER,
      kegiatanId: DataTypes.INTEGER,
      programId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "indikator",
    }
  );
  return indikator;
};
