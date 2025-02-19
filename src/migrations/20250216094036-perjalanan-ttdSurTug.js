"use strict";

const constraintName = "fk-perjalanan-ttdSurTug";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["ttdSurTugId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "ttdSurTugs",
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
