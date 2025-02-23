const currentDate = new Date();
const daftarKegiatans = [
  {
    id: 1,
    kegiatan: "Kegiatan 1",
    kodeRekening: "4435.05.001",
    sumber: "DPA Dinas Kesehatan 2025",
    PPTKId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    kegiatan: "Kegiatan 2",
    kodeRekening: "4435.05.002",
    sumber: "DPA Dinas Kesehatan 2025",
    PPTKId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    kegiatan: "kegiatan 3",
    kodeRekening: "4435.05.003",
    sumber: "DPA Dinas Kesehatan 2025",
    PPTKId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarKegiatans", daftarKegiatans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarKegiatans", null, {});
  },
};
