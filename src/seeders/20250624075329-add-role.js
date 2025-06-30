"use strict";
const currentDate = new Date();
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: 7,
        nama: "Kepegawaian",
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      {
        id: 8,
        nama: "admin sijaka",
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
