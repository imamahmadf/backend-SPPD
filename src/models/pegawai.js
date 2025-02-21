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
      this.hasMany(models.personil);
      this.belongsTo(models.daftarTingkatan);
      this.belongsTo(models.daftarPangkat);
      this.belongsTo(models.daftarGolongan);
      this.belongsTo(models.daftarUnitKerja);
    }
  }
  pegawai.init(
    {
      nama: DataTypes.STRING,
      nip: DataTypes.STRING,
      tingkatanId: DataTypes.INTEGER,
      pangkatId: DataTypes.INTEGER,
      golonganId: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      nomorRekening: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pegawai",
    }
  );
  return pegawai;
};
