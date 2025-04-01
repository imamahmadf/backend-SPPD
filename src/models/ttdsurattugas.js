"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdSuratTugas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "unitKerja-ttdSuratTugas",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
    }
  }
  ttdSuratTugas.init(
    {
      // nama: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      // pangkat: DataTypes.STRING,
      // golongan: DataTypes.STRING,
      // nip: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ttdSuratTugas",
    }
  );
  return ttdSuratTugas;
};
