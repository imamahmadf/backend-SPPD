const currentDate = new Date();
const jenisPerjalanans = [
  {
    id: 1,
    jenis: "Perjalanan Dinas Biasa",
    kodeRekening: "0001",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Perjalanan dinas Dalam Kota",
    kodeRekening: "0003",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisPerjalanans", jenisPerjalanans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisPerjalanans", null, {});
  },
};
