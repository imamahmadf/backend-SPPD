"use strict";

const constraintName = "fk-perjalanan-tempat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["tempatId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "tempats",
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
