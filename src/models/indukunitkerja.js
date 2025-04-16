'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class indukUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  indukUnitKerja.init({
    kode: DataTypes.STRING,
    tempalteSuratTugas: DataTypes.STRING,
    templateNotaDinas: DataTypes.STRING,
    templateSuratTugasSingkat: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'indukUnitKerja',
  });
  return indukUnitKerja;
};