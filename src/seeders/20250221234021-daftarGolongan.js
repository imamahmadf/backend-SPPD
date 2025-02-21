const currentDate = new Date();
const daftarGOlongans = [
  {
    id: 1,
    golongan: "IIA",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    golongan: "IIB",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    golongan: "IIC",
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
