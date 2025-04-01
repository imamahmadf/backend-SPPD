'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KPA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  KPA.init({
    pegawaiId: DataTypes.INTEGER,
    unitKerjaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'KPA',
  });
  return KPA;
};