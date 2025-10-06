"use strict";
const currentDate = new Date();
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: 11,
        nama: "perencanaan",
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      {
        id: 12,
        nama: "admin perencanaan",
        createdAt: currentDate,
        updatedAt: currentDate,
      },
    ];

    await queryInterface.bulkInsert("roles", roles, {
      updateOnDuplicate: ["id"],
    });
  },

  async down(queryInterface, Sequelize) {
    // Optional: kembalikan ke nama lama jika perlu rollback
  },
};
