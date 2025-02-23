"use strict";

const constraintName = "fk-daftarKegiatan-daftarSubKegiatan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("daftarSubKegiatans", {
      fields: ["kegiatanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarKegiatans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("daftarSubKegiatans", constraintName);
  },
};
