"use strict";

const currentDate = new Date();
const roles = [
  { id: 1, nama: "user", createdAt: currentDate, updatedAt: currentDate },
  { id: 2, nama: "admin", createdAt: currentDate, updatedAt: currentDate },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
