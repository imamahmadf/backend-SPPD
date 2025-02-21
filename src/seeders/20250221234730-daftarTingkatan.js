const currentDate = new Date();
const daftarTingkatans = [
  {
    id: 1,
    tingkatan: "Penata Muda",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    tingkatan: "Penata",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    tingkatan: "Pembina",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarTingkatans", daftarTingkatans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarTingkatans", null, {});
  },
};
