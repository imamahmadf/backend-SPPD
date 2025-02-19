"use strict";

const constraintName = "fk-perjalanan-ttdNotDis";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["ttdNotDisId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "ttdNotDis",
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
