"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("perjalanans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pegawaiId1: {
        type: Sequelize.INTEGER,
      },
      pegawaiId2: {
        type: Sequelize.INTEGER,
      },
      pegawaiId3: {
        type: Sequelize.INTEGER,
      },
      pegawaiId4: {
        type: Sequelize.INTEGER,
      },
      ttdSurTugId: {
        type: Sequelize.INTEGER,
      },
      ttdNotDisId: {
        type: Sequelize.INTEGER,
      },

      noSurTug: {
        type: Sequelize.STRING,
      },
      noNotDis: {
        type: Sequelize.STRING,
      },
      noSpd1: {
        type: Sequelize.STRING,
      },
      noSpd2: {
        type: Sequelize.STRING,
      },
      noSpd3: {
        type: Sequelize.STRING,
      },
      noSpd4: {
        type: Sequelize.STRING,
      },
      TanggalBerangkat: {
        type: Sequelize.DATE,
      },
      tanggalPulang: {
        type: Sequelize.DATE,
      },
      tempatId: {
        type: Sequelize.INTEGER,
      },
      tujuan: {
        type: Sequelize.STRING,
      },
      alasan: {
        type: Sequelize.STRING,
      },
      kodeRekeningId: {
        type: Sequelize.INTEGER,
      },
      tipe: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("perjalanans");
  },
};
