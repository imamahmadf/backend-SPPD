"use strict";

const constraintName = "fk-kwitGlobal-PPTK";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kwitGlobals", {
      fields: ["PPTKId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pptks",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kwitGlobals", constraintName);
  },
};
