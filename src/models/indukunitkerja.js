"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class indukUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.bendahara, {
        foreignKey: "indukUnitKerjaId",
      });
      this.hasMany(models.daftarUnitKerja, {
        foreignKey: "indukUnitKerjaId",
      });

      this.belongsTo(models.daftarNomorSurat, {
        foreignKey: "indukUnitKerjaId",
        as: "indukUnitKerja-nomorSurat",
      });
    }
  }
  indukUnitKerja.init(
    {
      kodeInduk: DataTypes.STRING,
      indukUnitKerja: DataTypes.STRING,
      templateSuratTugas: DataTypes.STRING,
      templateNotaDinas: DataTypes.STRING,
      templateSuratTugasSingkat: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "indukUnitKerja",
    }
  );
  return indukUnitKerja;
};
