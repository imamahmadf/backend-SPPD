const currentDate = new Date();
const daftarUnitKerjas = [
  {
    id: 1,
    unitKerja: "Sekertaris",
    kode: "SEKER",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    unitKerja: "Pelayanan Kesehatan",
    kode: "YANKES",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    unitKerja: "Sumber Daya Kesehatan",
    kode: "SDK",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    unitKerja: "Kesehatan Masyarakat",
    kode: "KESMAS",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    unitKerja: "Pencegahan Penyakit",
    kode: "P2P",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarUnitKerjas", daftarUnitKerjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarUnitKerjas", null, {});
  },
};
