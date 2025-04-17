const currentDate = new Date();
const daftarUnitKerjas = [
  {
    id: 1,
    unitKerja: " Bidang Sumber Daya Kesehatan",
    kode: "SDK",
    asal: "Tana Paser",
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    unitKerja: "Bidang Pelayanan Kesehatan",
    kode: "YANKES",
    asal: "Tana Paser",
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    unitKerja: "Bidang Kesehatan Masyarakat",
    kode: "KESMAS",
    asal: "Tana Paser",
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    unitKerja: "UPTD Perbekalan Obat & Alkes",
    kode: "POA",
    asal: "Tana Paser",
    indukUnitKerjaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    unitKerja: "UPTD Puskesmas Kuaro",
    kode: "PKM-KUARO",
    asal: "Kuaro",
    indukUnitKerjaId: 3,
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
