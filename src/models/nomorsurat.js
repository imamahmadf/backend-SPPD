'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nomorSurat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nomorSurat.init({
    jenis: DataTypes.STRING,
    nomor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nomorSurat',
  });
  return nomorSurat;
};