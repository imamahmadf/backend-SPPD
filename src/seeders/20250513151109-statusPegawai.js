"use strict";

const currentDate = new Date();
const statusPegawais = [
  { id: 1, status: "PNS", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    status: "CPNS",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  { id: 3, status: "P3K", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 4,
    status: "PTT",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusPegawais", statusPegawais, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusPegawais", null, {});
  },
};
