const currentDate = new Date();
const daftarKegiatans = [
  {
    id: 1,
    kegiatan: "Kegiatan 1",
    kodeRekening: "4435.05.001",
    subKegiatanId: 1,
    PPTKId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    kegiatan: "Kegiatan 2",
    kodeRekening: "4435.05.002",
    subKegiatanId: 1,
    PPTKId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    kegiatan: "kegiatan 3",
    kodeRekening: "4435.05.003",
    subKegiatanId: 2,
    PPTKId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    kegiatan: "kegiatan 4",
    kodeRekening: "4435.05.004",
    subKegiatanId: 3,
    PPTKId: 3,
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
