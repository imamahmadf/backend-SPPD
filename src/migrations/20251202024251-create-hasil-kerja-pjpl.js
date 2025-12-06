"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hasilKerjaPJPLs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      hasil: {
        type: Sequelize.INTEGER,
      },
      nilai: {
        type: Sequelize.INTEGER,
      },
      realisasiPJPLId: { type: Sequelize.INTEGER },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM("diajukan", "ditolak", "diterima"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hasilKerjaPJPLs");
  },
};
