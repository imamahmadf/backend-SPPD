"use strict";

const constraintName = "fk-kinerjaPJPL-realisasiPJPL";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kinerjaPJPLs", {
      fields: ["realisasiPJPLId"],
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
    await queryInterface.removeConstraint("kinerjaPJPLs", constraintName);
  },
};
