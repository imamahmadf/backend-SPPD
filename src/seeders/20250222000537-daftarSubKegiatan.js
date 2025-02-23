const currentDate = new Date();
const daftarSubKegiatans = [
  {
    id: 1,
    subKegiatan: "Sub Kegiatan 1",
    kodeRekening: "23.00.001",
    kegiatanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    subKegiatan: "Sub Kegiatan 2",
    kodeRekening: "23.00.002",
    kegiatanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    subKegiatan: "sub kegiatan 3",
    kodeRekening: "23.00.003",
    kegiatanId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    subKegiatan: "sub kegiatan 4",
    kodeRekening: "23.00.004",
    kegiatanId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "daftarSubKegiatans",
      daftarSubKegiatans,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarSubKegiatans", null, {});
  },
};
