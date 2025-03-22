const currentDate = new Date();
const ttdSuratTugas = [
  {
    id: 1,
    nama: "Amri",
    nip: "111222333",
    jabatan: "kepala Dinas Kesehatan",
    unitKerjaId: 1,
    pangkat: "Pembina",
    golongan: "IVB",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    nama: "Dr. Dewa",
    nip: "111222333 009",
    jabatan: "kepala Dinas Kesehatan 2022",
    unitKerjaId: 2,
    pangkat: "Pembina",
    golongan: "IVA",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("ttdSuratTugas", ttdSuratTugas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ttdSuratTugas", null, {});
  },
};
