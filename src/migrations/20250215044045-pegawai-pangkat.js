"use strict";

const constraintName = "fk-pegawai-pangkat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawais", {
      fields: ["pangkatId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pangkats",
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
