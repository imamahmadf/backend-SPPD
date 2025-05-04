const currentDate = new Date();
const daftarGOlongans = [
  {
    id: 1,
    golongan: "-",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    golongan: "II c",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    golongan: "II d",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 4,
    golongan: "III a",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    golongan: "III b",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    golongan: "III c",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 7,
    golongan: "III d",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    golongan: "IV a",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    golongan: "IV b",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 10,
    golongan: "IV c",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    golongan: "IV d",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarGOlongans", daftarGOlongans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarGOlongans", null, {});
  },
};
