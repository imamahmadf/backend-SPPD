"use strict";

const constraintName = "fk-suratPengantar-penandatangan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("suratPengantars", {
      fields: ["penandatanganId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "pegawais",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("suratPengantars", constraintName);
  },
};
