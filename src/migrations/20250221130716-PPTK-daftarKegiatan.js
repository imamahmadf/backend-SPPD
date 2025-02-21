"use strict";

const constraintName = "fk-PPTK-daftarKegiatan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("daftarKegiatans", {
      fields: ["PPTKId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "PPTKs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("daftarKegiatans", constraintName);
  },
};
