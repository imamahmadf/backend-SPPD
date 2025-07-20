"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class usulanPegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
    }
  }
  usulanPegawai.init(
    {
      pegawaiId: DataTypes.INTEGER,
      dokumen: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "usulanPegawai",
    }
  );
  return usulanPegawai;
};
