"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom unitKerjaId
    await queryInterface.addColumn("indikators", "unitKerjaId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Menambahkan kolom pegawaiId
    await queryInterface.addColumn("indikators", "pegawaiId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom pegawaiId
    await queryInterface.removeColumn("indikators", "pegawaiId");
    // Menghapus kolom unitKerjaId
    await queryInterface.removeColumn("indikators", "unitKerjaId");
  },
};
