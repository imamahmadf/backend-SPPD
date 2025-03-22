const currentDate = new Date();
const dalamKota = [
  {
    id: 1,
    uangTransport: 0,
    nama: "Luar Kota",
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    uangTransport: 150000,
    nama: "Puskesmas Kuaro",
    durasi: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    uangTransport: 190000,
    nama: "Puskesmas Long Ikis",
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    uangTransport: 100000,
    nama: "Puskesmas Lolo",
    durasi: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    uangTransport: 200000,
    nama: "Puskesmas Batu Kajang",
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("dalamKota", dalamKota, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("dalamKota", null, {});
  },
};
