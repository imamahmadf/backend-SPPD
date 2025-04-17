const currentDate = new Date();
const indukUnitKerjas = [
  {
    id: 1,
    indukUnitKerja: "Dinas Kesehatan",
    kodeInduk: "DINKES",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    indukUnitKerja: "UPTD Perbekalan Obat & Alkes",
    kodeInduk: "POA",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    indukUnitKerja: "UPTD Puskesmas Kuaro",
    kodeInduk: "PKM-KUARO",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("indukUnitKerjas", indukUnitKerjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("indukUnitKerjas", null, {});
  },
};
