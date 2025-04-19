const currentDate = new Date();
const daftarNomorSurats = [
  {
    id: 1,
    // nomorSurat: "800.1.11.1/NOMOR/BULAN/2025",
    nomorLoket: 0,
    jenisId: 1,
    indukUnitKerjaId: 1,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    // nomorSurat: "800.1.11.1/NOMOR/BULAN/2025",
    nomorLoket: 0,
    jenisId: 2,
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    // nomorSurat: "000.1.2.3/NOMOR/DINKES/2025",
    nomorLoket: 0,
    jenisId: 3,
    indukUnitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    // nomorSurat: "800.1.11.1/NOMOR/BULAN/2025",
    nomorLoket: 0,
    jenisId: 1,
    indukUnitKerjaId: 2,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    // nomorSurat: "800.1.11.1/NOMOR/BULAN/2025",
    nomorLoket: 0,
    jenisId: 2,
    indukUnitKerjaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    // nomorSurat: "000.1.2.3/NOMOR/DINKES/2025",
    nomorLoket: 0,
    jenisId: 3,
    indukUnitKerjaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarNomorSurats", daftarNomorSurats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarNomorSurats", null, {});
  },
};
