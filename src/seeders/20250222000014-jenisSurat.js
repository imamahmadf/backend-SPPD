const currentDate = new Date();
const jenisSurats = [
  {
    id: 1,
    jenis: "Surat Tugas",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Nota Dinas",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenis: "SPD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisSurats", jenisSurats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisSurats", null, {});
  },
};
