const currentDate = new Date();
const pegawais = [
  {
    id: 1,
    nama: "H. Imam Mahdi MA. Mk. DLL",
    nip: "1112223 09 0033",
    jabatan: "tenaga ahli nuklir",
    unitKerjaId: 1,
    tingkatanId: 1,
    pangkatId: 1,
    golonganId: 1,
    nomorRekening: "081250628584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    nama: "Nasran",
    nip: "111222333 009",
    jabatan: "koki teripang",
    unitKerjaId: 2,
    tingkatanId: 2,
    pangkatId: 2,
    golonganId: 2,
    nomorRekening: "099250628584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    nama: "Albert Einsten KKL.",
    nip: "1112223344 009",
    jabatan: "supir kereta api",
    unitKerjaId: 2,
    tingkatanId: 2,
    pangkatId: 2,
    golonganId: 2,
    nomorRekening: "081250690584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    nama: "miko si kucing oren",
    nip: "111243443 009",
    jabatan: "penagkap cicak",
    unitKerjaId: 1,
    tingkatanId: 1,
    pangkatId: 1,
    golonganId: 1,
    nomorRekening: "03330628584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    nama: "Susi Susanti",
    nip: "111223333 009",
    jabatan: "atlet renang",
    unitKerjaId: 2,
    tingkatanId: 2,
    pangkatId: 2,
    golonganId: 2,
    nomorRekening: "081250628584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    nama: "nama siapa aja",
    nip: "1145342333 009",
    jabatan: "palu gada",
    unitKerjaId: 1,
    tingkatanId: 1,
    pangkatId: 2,
    golonganId: 1,
    nomorRekening: "0332628584",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("pegawais", pegawais, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("pegawais", null, {});
  },
};
