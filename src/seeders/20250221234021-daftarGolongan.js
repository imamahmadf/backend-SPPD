const currentDate = new Date();
const daftarGOlongans = [
  {
    id: 1,
    golongan: "IV b",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    golongan: "IV a",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    golongan: "III d",
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
