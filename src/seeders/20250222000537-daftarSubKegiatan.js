const currentDate = new Date();
const daftarSubKegiatans = [
  {
    id: 1,
    subKegiatan: "Penyusunan Dokumen Perencanaan Perangkat Daerah",
    kodeRekening: "1.02.01.2.01.01",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    subKegiatan: "Koordinasi dan Penyusunan DPA-SKPD",
    kodeRekening: "1.02.01.2.01.04",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    subKegiatan: "Evaluasi Kinerja Perangkat Daerah",
    kodeRekening: "1.02.01.2.01.07",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    subKegiatan: "Penyediaan Gaji dan Tunjangan ASN",
    kodeRekening: "1.02.01.2.02.01",

    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 5,
    subKegiatan:
      "Pelaksanaan Penatausahaan dan Pengujian/Verifikasi Keuangan SKPD",
    kodeRekening: "1.02.01.2.02.03",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    subKegiatan: "Koordinasi dan Penyusunan Laporan Keuangan Akhir Tahun SKPD",
    kodeRekening: "1.02.01.2.02.05",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 7,
    subKegiatan: "Monitoring, Evaluasi, dan Penilaian Kinerja Pegawai",
    kodeRekening: "1.02.01.2.05.05",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    subKegiatan:
      "Penyediaan Komponen Instalasi Listrik/Penerangan Bangunan Kantor",
    kodeRekening: "1.02.01.2.06.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    subKegiatan: "Penyediaan Peralatan dan Perlengkapan Kantor",
    kodeRekening: "1.02.01.2.06.02",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 10,
    subKegiatan: "Penyediaan Peralatan Rumah Tangga",
    kodeRekening: "1.02.01.2.06.03",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    subKegiatan: "Penyediaan Bahan Logistik Kantor",
    kodeRekening: "1.02.01.2.06.04",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 12,
    subKegiatan: "Penyediaan Barang Cetakan dan Penggandaan",
    kodeRekening: "1.02.01.2.06.05",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 13,
    subKegiatan: "Penyediaan Bahan Bacaan dan Peraturan Perundang-undangan",
    kodeRekening: "1.02.01.2.06.06",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 14,
    subKegiatan: "Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD",
    kodeRekening: "1.02.01.2.06.09",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 15,
    subKegiatan: "Pengadaan Mebel",
    kodeRekening: "1.02.01.2.07.05",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 16,
    subKegiatan: "Pengadaan Peralatan dan Mesin Lainnya",
    kodeRekening: "1.02.01.2.07.06",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 17,
    subKegiatan: "Penyediaan Jasa Surat Menyurat",
    kodeRekening: "1.02.01.2.08.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 18,
    subKegiatan: "Penyediaan Jasa Pelayanan Umum Kantor",
    kodeRekening: "1.02.01.2.08.04",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 19,
    subKegiatan:
      "Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan, dan Pajak Kendaraan Perorangan Dinas atau Kendaraan Dinas Jabatan",
    kodeRekening: "1.02.01.2.09.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 20,
    subKegiatan:
      "Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan, Pajak dan Perizinan Kendaraan Dinas Operasional atau Lapangan",
    kodeRekening: "1.02.01.2.09.02",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 21,
    subKegiatan: "Pemeliharaan Peralatan dan Mesin Lainnya",
    kodeRekening: "1.02.01.2.09.06",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 22,
    subKegiatan: "Rehabilitasi dan Pemeliharaan Puskesmas",
    kodeRekening: "1.02.02.2.01.09",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 23,
    subKegiatan: "Rehabilitasi dan Pemeliharaan Fasilitas Kesehatan Lainnya",
    kodeRekening: "1.02.02.2.01.10",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 24,
    subKegiatan: "Rehabilitasi dan Pemeliharaan Rumah Dinas Tenaga Kesehatan",
    kodeRekening: "1.02.02.2.01.11",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 25,
    subKegiatan:
      "Pengadaan Prasarana dan Pendukung Fasilitas Pelayanan Kesehatan",
    kodeRekening: "1.02.02.2.01.13",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 26,
    subKegiatan:
      "Pengadaan Alat Kesehatan/Alat Penunjang Medik Fasilitas Pelayanan Kesehatan",
    kodeRekening: "1.02.02.2.01.14",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 27,
    subKegiatan: "Pengadaan Obat, Vaksin",
    kodeRekening: "1.02.02.2.01.16",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 28,
    subKegiatan: "Pengadaan Bahan Habis Pakai",
    kodeRekening: "1.02.02.2.01.17",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 29,
    subKegiatan:
      "Pemeliharaan Rutin dan Berkala Alat Kesehatan/Alat Penunjang Medik Fasilitas Pelayanan Kesehatan",
    kodeRekening: "1.02.02.2.01.20",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 30,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Ibu Hamil",
    kodeRekening: "1.02.02.2.02.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 31,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Ibu Bersalin",
    kodeRekening: "1.02.02.2.02.02",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 32,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Bayi Baru Lahir",
    kodeRekening: "1.02.02.2.02.03",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 33,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Balita",
    kodeRekening: "1.02.02.2.02.04",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 34,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan pada Usia Pendidikan Dasar",
    kodeRekening: "1.02.02.2.02.05",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 35,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan pada Usia Lanjut",
    kodeRekening: "1.02.02.2.02.07",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 36,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Penderita Diabetes Melitus",
    kodeRekening: "1.02.02.2.02.09",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 37,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Orang Terduga Tuberkulosis",
    kodeRekening: "1.02.02.2.02.11",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 38,
    subKegiatan:
      "Pengelolaan Pelayanan Kesehatan Orang dengan Risiko Terinfeksi HIV",
    kodeRekening: "1.02.02.2.02.12",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 39,
    subKegiatan:
      "Pengelolaan Pelayanan Kesehatan bagi Penduduk pada Kondisi Kejadian Luar Biasa (KLB)",
    kodeRekening: "1.02.02.2.02.13",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 40,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Gizi Masyarakat",
    kodeRekening: "1.02.02.2.02.15",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 41,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Kerja dan Olahraga",
    kodeRekening: "1.02.02.2.02.16",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 42,
    subKegiatan: "Pengelolaan Pelayanan Kesehatan Lingkungan",
    kodeRekening: "1.02.02.2.02.17",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 43,
    subKegiatan: "Pengelolaan Pelayanan Promosi Kesehatan",
    kodeRekening: "1.02.02.2.02.18",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 44,
    subKegiatan:
      "Pengelolaan Pelayanan Kesehatan Tradisional, Akupuntur, Asuhan Mandiri, dan Tradisional Lainnya",
    kodeRekening: "1.02.02.2.02.19",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 45,
    subKegiatan: "Pengelolaan Surveilans Kesehatan",
    kodeRekening: "1.02.02.2.02.20",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 46,
    subKegiatan:
      "Pengelolaan Pelayanan Kesehatan Orang dengan Masalah Kesehatan Jiwa (ODMK)",
    kodeRekening: "1.02.02.2.02.21",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 47,
    subKegiatan: "Pengelolaan Upaya Kesehatan Khusus",
    kodeRekening: "1.02.02.2.02.23",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 48,
    subKegiatan: "Pelayanan Kesehatan Penyakit Menular dan Tidak Menular",
    kodeRekening: "1.02.02.2.02.25",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 49,
    subKegiatan: "Pengelolaan Jaminan Kesehatan Masyarakat",
    kodeRekening: "1.02.02.2.02.26",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 50,
    subKegiatan: "Penyediaan Telemedicine di Fasilitas Pelayanan Kesehatan",
    kodeRekening: "1.02.02.2.02.30",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 51,
    subKegiatan: "Pengelolaan Penelitian Kesehatan",
    kodeRekening: "1.02.02.2.02.31",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 52,
    subKegiatan: "Operasional Pelayanan Puskesmas",
    kodeRekening: "1.02.02.2.02.33",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 53,
    subKegiatan: "Pelaksanaan Akreditasi Fasilitas Kesehatan di Kabupaten/Kota",
    kodeRekening: "1.02.02.2.02.35",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 54,
    subKegiatan:
      "Investigasi Awal Kejadian Tidak Diharapkan (Kejadian Ikutan Pasca Imunisasi dan Pemberian Obat Massal)",
    kodeRekening: "1.02.02.2.02.36",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 55,
    subKegiatan: "Pelaksanaan Kewaspadaan Dini dan Respon Wabah",
    kodeRekening: "1.02.02.2.02.37",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 56,
    subKegiatan:
      "Penyediaan dan Pengelolaan Sistem Penanganan Gawat Darurat Terpadu (SPGDT)",
    kodeRekening: "1.02.02.2.02.38",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 57,
    subKegiatan:
      "Pengelolaan Pelayanan Kesehatan Dasar Melalui Pendekatan Keluarga",
    kodeRekening: "1.02.02.2.02.39",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 58,
    subKegiatan: "Pengelolaan pelayanan kesehatan Malaria",
    kodeRekening: "1.02.02.2.02.42",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 59,
    subKegiatan: "Pengelolaan Data dan Informasi Kesehatan",
    kodeRekening: "1.02.02.2.03.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 60,
    subKegiatan: "Pengelolaan Sistem Informasi Kesehatan",
    kodeRekening: "1.02.02.2.03.02",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 61,
    subKegiatan:
      "Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Perizinan Rumah Sakit Kelas C, D dan Fasilitas Pelayanan Kesehatan Lainnya",
    kodeRekening: "1.02.02.2.04.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 62,
    subKegiatan: "Peningkatan Mutu Pelayanan Fasilitas Kesehatan",
    kodeRekening: "1.02.02.2.04.03",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 63,
    subKegiatan:
      "Penyiapan Perumusan dan Pelaksanaan Pelayanan Kesehatan Rujukan",
    kodeRekening: "1.02.02.2.04.04",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 64,
    subKegiatan:
      "Pemenuhan Kebutuhan Sumber Daya Manusia Kesehatan Sesuai Standar",
    kodeRekening: "1.02.03.2.02.02",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 65,
    subKegiatan: "Pembinaan dan Pengawasan Sumber Daya Manusia Kesehatan",
    kodeRekening: "1.02.03.2.02.03",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 66,
    subKegiatan:
      "Pengembangan Mutu dan Peningkatan Kompetensi Teknis Sumber Daya Manusia Kesehatan Tingkat Daerah Kabupaten/Kota",
    kodeRekening: "1.02.03.2.03.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 67,
    subKegiatan:
      "Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Perizinan Apotek, Toko Obat, Toko Alat Kesehatan, dan Optikal, Usaha Mikro Obat Tradisional (UMOT)",
    kodeRekening: "1.02.04.2.01.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 68,
    subKegiatan:
      "Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Sertifikat Produksi Pangan Industri Rumah Tangga dan Nomor P-IRT sebagai Izin Produksi, untuk Produk Makanan Minuman Tertentu yang Dapat Diproduksi oleh Industri Rumah Tangga",
    kodeRekening: "1.02.04.2.03.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 69,
    subKegiatan:
      "Pengendalian dan Pengawasan serta Tindak Lanjut Pengawasan Penerbitan Sertifikat Laik Higiene Sanitasi Tempat Pengelolaan Makanan (TPM) antara lain Jasa Boga, Rumah Makan/Restoran dan Depot Air Minum (DAM)",
    kodeRekening: "1.02.04.2.04.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 70,
    subKegiatan:
      "Pengendalian dan Pengawasan serta Tindak Lanjut Penerbitan Stiker Pembinaan pada Makanan Jajanan dan Sentra Makanan Jajanan",
    kodeRekening: "1.02.04.2.05.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 71,
    subKegiatan:
      "Peningkatan Upaya Promosi Kesehatan, Advokasi, Kemitraan dan Pemberdayaan Masyarakat",
    kodeRekening: "1.02.05.2.01.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 72,
    subKegiatan:
      "Penyelenggaraan Promosi Kesehatan dan Gerakan Hidup Bersih dan Sehat",
    kodeRekening: "1.02.05.2.02.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 73,
    subKegiatan:
      "Bimbingan Teknis dan Supervisi Pengembangan dan Pelaksanaan Upaya Kesehatan Bersumber Daya Masyarakat (UKBM)",
    kodeRekening: "1.02.05.2.03.01",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "daftarSubKegiatans",
      daftarSubKegiatans,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarSubKegiatans", null, {});
  },
};
