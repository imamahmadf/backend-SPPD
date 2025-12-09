"use strict";

const constraintName = "fk-realisasiPJPL-kinerjaPJPL";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("realisasiPJPLs", {
      fields: ["kinerjaPJPLId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kinerjaPJPLs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("realisasiPJPLs", constraintName);
  },
};
