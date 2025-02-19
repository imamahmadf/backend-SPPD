"use strict";

const currentDate = new Date();
const golongans = [
  { id: 1, nama: "pangkat1", createdAt: currentDate, updatedAt: currentDate },
  { id: 2, nama: "pangkat2", createdAt: currentDate, updatedAt: currentDate },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("pangkats", golongans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("pangkats", null, {});
  },
};
