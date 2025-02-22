const currentDate = new Date();
const PPTKs = [
  {
    id: 1,
    nama: "Dian",
    nip: "111222333",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    nama: "Dr. Ainun",
    nip: "111222444",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    nama: "Dr. Adis",
    nip: "111222555",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("PPTKs", PPTKs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("PPTKs", null, {});
  },
};
