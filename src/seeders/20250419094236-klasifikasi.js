const currentDate = new Date();
const klasifikasis = [
  {
    id: "1",
    kode: "000.1",
    namaKlasifikasi: "KETATAUSAHAAN DAN KERUMTANGGAAN",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: "2",
    kode: "000.2",
    namaKlasifikasi: "PERLENGKAPAN",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: "3",
    kode: "000.3",
    namaKlasifikasi: "PENGADAAN",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: "4",
    kode: "800.1",
    namaKlasifikasi: "SUMBER DAYA MANUSIA",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: "5",
    kode: "400.7",
    namaKlasifikasi: "KESEHATAN",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: "6",
    kode: "000.5",
    namaKlasifikasi: "KEARSIPAN",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: "7",
    kode: "900.1",
    namaKlasifikasi: "KEUANGAN DAERAH",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("klasifikasis", klasifikasis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("klasifikasis", null, {});
  },
};
