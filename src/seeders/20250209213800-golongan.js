"use strict";

const currentDate = new Date();
const golongans = [
  { id: 1, golongan: "III A", createdAt: currentDate, updatedAt: currentDate },
  { id: 2, golongan: "III B", createdAt: currentDate, updatedAt: currentDate },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("golongans", golongans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("golongas", null, {});
  },
};
