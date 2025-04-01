const currentDate = new Date();
const daftarUnitKerjas = [
  {
    id: 1,
    unitKerja: "Dinas Kesehatan",
    kode: "DINKES",
    asal: "Tana Paser",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    unitKerja: "UPTD Perbekalan Obat dan Alkes",
    kode: "POA",
    asal: "Tana Paser",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    unitKerja: "UPTD Puskesmas Tanah Grogot",
    kode: "PKM-TGT",
    asal: "Tana Paser",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    unitKerja: "UPTD Labkesda",
    kode: "LAP",
    asal: "Tana Paser",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    unitKerja: "UPTD Puskesmas Kuaro",
    kode: "PKM-KUARO",
    asal: "Kuaro",
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
