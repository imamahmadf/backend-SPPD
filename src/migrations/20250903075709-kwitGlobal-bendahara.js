"use strict";

const constraintName = "fk-kwitGlobal-bendahara";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kwitGlobals", {
      fields: ["bendaharaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "bendaharas",
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
