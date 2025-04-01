"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "unitKerjaId",
        as: "daftarUnitKerja",
      });
      this.belongsTo(models.dalamKota);
      this.belongsTo(models.ttdSuratTugas, {
        foreignKey: "unitKerjaId",
        as: "unitKerja-ttdSuratTugas",
      });
      this.belongsTo(models.ttdNotaDinas);
      this.belongsTo(models.PPTK);
      this.belongsTo(models.profile, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_profile",
      });
      this.belongsTo(models.daftarNomorSurat, {
        foreignKey: "unitKerjaId",
        as: "unitKerja-nomorSurat",
      });
    }
  }
  daftarUnitKerja.init(
    {
      unitKerja: DataTypes.STRING,
      kode: DataTypes.STRING,
      asal: DataTypes.STRING,
      templateSuratTugas: DataTypes.STRING,
      templateNotaDinas: DataTypes.STRING,
      templateSPD: DataTypes.STRING,
      tempalteKuitansi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarUnitKerja",
    }
  );
  return daftarUnitKerja;
};
