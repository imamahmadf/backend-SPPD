"use strict";

const constraintName = "fk-pegawai-golongan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawais", {
      fields: ["golonganId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "golongans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pegawais", constraintName);
  },
};
