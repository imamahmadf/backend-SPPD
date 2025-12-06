"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pejabatVerifikator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
      this.hasMany(models.indikatorPejabat);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  pejabatVerifikator.init(
    {
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pejabatVerifikator",
    }
  );
  return pejabatVerifikator;
};
