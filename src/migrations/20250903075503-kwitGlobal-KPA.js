"use strict";

const constraintName = "fk-kwitGlobal-KPA";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kwitGlobals", {
      fields: ["KPAId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kpas",
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
