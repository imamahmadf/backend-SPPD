"use strict";

const constraintNameUnitKerja = "fk-indikator-unitKerja";
const constraintNamePegawai = "fk-indikator-pegawai";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan foreign key constraint untuk unitKerjaId
    await queryInterface.addConstraint("indikators", {
      fields: ["unitKerjaId"],
      type: "foreign key",
      name: constraintNameUnitKerja,
      references: {
        table: "daftarUnitKerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    // Menambahkan foreign key constraint untuk pegawaiId
    await queryInterface.addConstraint("indikators", {
      fields: ["pegawaiId"],
      type: "foreign key",
      name: constraintNamePegawai,
      references: {
        table: "pegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    // Menghapus foreign key constraint untuk pegawaiId
    await queryInterface.removeConstraint("indikators", constraintNamePegawai);
    // Menghapus foreign key constraint untuk unitKerjaId
    await queryInterface.removeConstraint(
      "indikators",
      constraintNameUnitKerja
    );
  },
};
