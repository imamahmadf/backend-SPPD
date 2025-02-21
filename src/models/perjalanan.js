"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class perjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.tempat);
      this.belongsTo(models.daftarKegiatan);
      this.hasMany(models.personil);
    }
  }
  perjalanan.init(
    {
      untuk: DataTypes.STRING,
      asal: DataTypes.STRING,
      noNotaDinas: DataTypes.STRING,
      noSuratTugas: DataTypes.STRING,
      tanggalPengajuan: DataTypes.DATE,
      ttdSuratTugasId: DataTypes.INTEGER,
      kegiatanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "perjalanan",
    }
  );
  return perjalanan;
};
