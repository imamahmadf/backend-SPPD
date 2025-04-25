const currentDate = new Date();
const sumberDanas = [
  {
    id: 1,
    sumber: "APBD",
    untukPembayaran: "untuk pembayaran ABPD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    sumber: "BLUD",
    untukPembayaran: "untuk pembayaran BLUD",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    sumber: "BPJS",
    untukPembayaran: "untuk pembayaran BPJS",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("sumberDanas", sumberDanas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sumberDanas", null, {});
  },
};
