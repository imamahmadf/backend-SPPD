const currentDate = new Date();
const bendaharas = [
  {
    id: 1,
    unitKerjaId: 1,
    pegawaiId: 7,
    jabatan: "Bendahara Pengeluaran",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    unitKerjaId: 1,
    pegawaiId: 8,
    jabatan: "Bendahara Pengeluaran",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    unitKerjaId: 2,
    pegawaiId: 9,
    jabatan: "Bendahara Pengeluaran Pembantu",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("bendaharas", bendaharas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bendaharas", null, {});
  },
};
