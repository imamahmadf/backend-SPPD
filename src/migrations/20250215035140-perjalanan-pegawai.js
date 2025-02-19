"use strict";

const constraintName = "fk-perjalanan-pegawai";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["pegawaiId1"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    // Menambahkan constraint untuk pegawaiId2
    await queryInterface.addConstraint("perjalanans", {
      fields: ["pegawaiId2"],
      type: "foreign key",
      name: "fk-perjalanan-pegawai2", // Nama constraint baru
      references: {
        table: "pegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    // Menambahkan constraint untuk pegawaiId3
    await queryInterface.addConstraint("perjalanans", {
      fields: ["pegawaiId3"],
      type: "foreign key",
      name: "fk-perjalanan-pegawai3", // Nama constraint baru
      references: {
        table: "pegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    // Menambahkan constraint untuk pegawaiId4
    await queryInterface.addConstraint("perjalanans", {
      fields: ["pegawaiId4"],
      type: "foreign key",
      name: "fk-perjalanan-pegawai4", // Nama constraint baru
      references: {
        table: "pegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    // // Menambahkan constraint untuk pegawaiId4
    // await queryInterface.addConstraint("perjalanans", {
    //   fields: ["ttdSurTugId"],
    //   type: "foreign key",
    //   name: "fk-perjalanan-ttdSurTug", // Nama constraint baru
    //   references: {
    //     table: "pegawais",
    //     field: "id",
    //   },
    //   onDelete: "cascade",
    //   onUpdate: "cascade",
    // });

    // // Menambahkan constraint untuk pegawaiId4
    // await queryInterface.addConstraint("perjalanans", {
    //   fields: ["ttdNotDisId"],
    //   type: "foreign key",
    //   name: "fk-perjalanan-ttdNotDis", // Nama constraint baru
    //   references: {
    //     table: "pegawais",
    //     field: "id",
    //   },
    //   onDelete: "cascade",
    //   onUpdate: "cascade",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("perjalanans", constraintName);
  },
};
