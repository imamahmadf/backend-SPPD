"use strict";

const constraintName = "fk-ttdSuratTugas-indukUnitKerja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("ttdSuratTugas", {
      fields: ["indukUnitKerjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "indukUnitkerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("ttdSuratTugas", constraintName);
  },
};
