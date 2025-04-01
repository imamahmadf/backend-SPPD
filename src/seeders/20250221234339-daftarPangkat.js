const currentDate = new Date();
const daftarPangkats = [
  {
    id: 1,
    pangkat: "Pembina Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    pangkat: "Pembina",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    pangkat: "Penata Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarPangkats", daftarPangkats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarPangkats", null, {});
  },
};
