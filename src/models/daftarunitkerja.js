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
      // this.belongsTo(models.dalamKota);
      // this.belongsTo(models.ttdSuratTugas, {
      //   foreignKey: "unitKerjaId",
      //   as: "unitKerja_ttdSuratTugas",
      // });
      this.belongsTo(models.ttdNotaDinas, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_notaDinas",
      });
      this.belongsTo(models.PPTK);
      this.belongsTo(models.KPA);

      this.belongsTo(models.profile, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_profile",
      });
      // this.belongsTo(models.daftarNomorSurat, {
      //   foreignKey: "unitKerjaId",
      //   as: "unitKerja-nomorSurat",
      // });
      this.belongsTo(models.indukUnitKerja, {
        foreignKey: "indukUnitKerjaId",
      });
    }
  }
  daftarUnitKerja.init(
    {
      unitKerja: DataTypes.STRING,
      kode: DataTypes.STRING,
      asal: DataTypes.STRING,
      indukUnitKerjaId: DataTypes.INTEGER,
      // templateSuratTugas: DataTypes.STRING,
      // templateSuratTugasSingkat: DataTypes.STRING,
      // templateNotaDinas: DataTypes.STRING,
      // templateSPD: DataTypes.STRING,
      // tempalteKuitansi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarUnitKerja",
    }
  );
  return daftarUnitKerja;
};
