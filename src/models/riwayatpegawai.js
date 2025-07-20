'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class riwayatPegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  riwayatPegawai.init({
    pegawaiId: DataTypes.INTEGER,
    tanggal: DataTypes.DATE,
    keterangan: DataTypes.STRING,
    unitKerjaLamaId: DataTypes.INTEGER,
    unitKerjaBaruId: DataTypes.INTEGER,
    profesiLamaId: DataTypes.INTEGER,
    profesiBaruId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'riwayatPegawai',
  });
  return riwayatPegawai;
};