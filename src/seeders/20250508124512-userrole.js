"use strict";

const currentDate = new Date();
const userRoles = [
  {
    id: 1,
    userId: 1,
    roleId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    userId: 1,
    roleId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("userRoles", userRoles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("userRoles", null, {});
  },
};
