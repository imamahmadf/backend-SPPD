"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class stokMasuk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.belongsTo(models.persediaan);
      this.hasMany(models.stokKeluar);
    }
  }
  stokMasuk.init(
    {
      unitKerjaId: DataTypes.INTEGER,
      persediaanId: DataTypes.INTEGER,
      jumlah: DataTypes.INTEGER,
      hargaSatuan: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      tanggal: DataTypes.DATE,
      spesifikasi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "stokMasuk",
    }
  );
  return stokMasuk;
};
