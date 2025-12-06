"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class personil extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.perjalanan);
      this.belongsTo(models.pegawai);
      this.hasMany(models.rincianBPD);
      this.belongsTo(models.status);
    }
  }
  personil.init(
    {
      pegawaiId: DataTypes.INTEGER,
      perjalananId: DataTypes.INTEGER,
      statusId: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      nomorSPD: DataTypes.STRING,
      catatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "personil",
      hooks: {
        // Hook setelah update untuk emit notifikasi jika statusId berubah
        afterUpdate: async (personilInstance, options) => {
          // Cek apakah statusId berubah menjadi 2 atau dari 2
          const wasStatusId2 = personilInstance._previousDataValues?.statusId === 2;
          const isStatusId2 = personilInstance.statusId === 2;
          
          if (wasStatusId2 !== isStatusId2) {
            // Ada perubahan yang mempengaruhi count statusId=2
            try {
              // Coba akses io dari global atau dari helper
              if (global.socketIO) {
                const { emitNotifikasiPersonil } = require("../controllers/notifikasiControllers");
                await emitNotifikasiPersonil(global.socketIO);
              }
            } catch (err) {
              // Jangan gagalkan update jika notifikasi gagal
              console.error("⚠️ Error emit notifikasi dari hook:", err.message);
            }
          }
        },
      },
    }
  );
  return personil;
};
