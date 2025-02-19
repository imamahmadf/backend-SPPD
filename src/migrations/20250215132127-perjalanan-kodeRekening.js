"use strict";

const constraintName = "fk-perjalanan-kodeRekening";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["kodeRekeningId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kodeRekenings",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("perjalanans", constraintName);
  },
};
