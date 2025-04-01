"use strict";

const constraintName = "fk-dalamKota-unitKerja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("dalamKota", {
      fields: ["unitKerjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarunitkerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("dalamKota", constraintName);
  },
};
