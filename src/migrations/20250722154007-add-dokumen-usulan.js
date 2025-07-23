"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("UsulanPegawais", "formulirUsulan", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "skCpns", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "skPns", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "PAK", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "skJafung", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "skp", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "skMutasi", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "STR", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "suratCuti", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UsulanPegawais", "gelar", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("UsulanPegawais", "formulirUsulan");
    await queryInterface.removeColumn("UsulanPegawais", "skCpns");
    await queryInterface.removeColumn("UsulanPegawais", "skPns");
    await queryInterface.removeColumn("UsulanPegawais", "PAK");
    await queryInterface.removeColumn("UsulanPegawais", "skJafung");
    await queryInterface.removeColumn("UsulanPegawais", "skp");
    await queryInterface.removeColumn("UsulanPegawais", "skMutasi");
    await queryInterface.removeColumn("UsulanPegawais", "STR");
    await queryInterface.removeColumn("UsulanPegawais", "suratCuti");
    await queryInterface.removeColumn("UsulanPegawais", "gelar");
  },
};
