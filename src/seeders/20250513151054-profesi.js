"use strict";

const currentDate = new Date();
const profesis = [
  { id: 1, nama: "Perawat", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    nama: "Perawat Gigi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  { id: 3, nama: "Dokter", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 4,
    nama: "Dokter Spesialis",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    nama: "Dokter Gigi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    nama: "Ahli Gizi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 7,
    nama: "Kesehatan lingkungan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    nama: "Struktural",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("profesis", profesis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profesis", null, {});
  },
};
