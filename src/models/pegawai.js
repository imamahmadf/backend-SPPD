"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan, { foreignKey: "pegawaiId1" });
      this.hasMany(models.perjalanan, { foreignKey: "pegawaiId2" });
      this.hasMany(models.perjalanan, { foreignKey: "pegawaiId3" });
      this.hasMany(models.perjalanan, { foreignKey: "pegawaiId4" });
      this.hasMany(models.perjalanan, { foreignKey: "ttdSurTugId" });
      this.hasMany(models.perjalanan, { foreignKey: "ttdNotDisId" });
      this.belongsTo(models.golongan);
      this.belongsTo(models.pangkat);
    }
  }
  pegawai.init(
    {
      nama: DataTypes.STRING,
      nip: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      pangkatId: DataTypes.INTEGER,
      golonganId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pegawai",
    }
  );
  return pegawai;
};
