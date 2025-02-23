const {
  perjalanan,
  kodeRekening,
  pegawai,
  daftarKegiatan,
  daftarSubKegiatan,
  PPTK,
  ttdSuratTugas,
  daftarNomorSurat,
  jenisSurat,
  jenisTempat,
} = require("../models");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");

module.exports = {
  postNotaDinas: async (req, res) => {
    try {
      // Ambil data dari request body
      const {
        pegawai,
        tanggalPengajuan,
        kodeRekeningFE,
        noSurat,
        untuk,
        dataTtdSurTug,
        ttdNotDis,
        asal,
      } = req.body;

      console.log(req.body);

      const dbPerjalanan = await perjalanan.create({
        untuk,
        noNotDis: "1",
        asal,
        tanggalPengajuan,
      });

      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public/template/notaDinas.docx"
      );

      // Baca file template
      const content = fs.readFileSync(templatePath, "binary");

      // Load file ke PizZip
      const zip = new PizZip(content);

      // Inisialisasi Docxtemplater dengan opsi terbaru
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Masukkan data ke dalam template
      doc.render({
        tanggalPengajuan,
        untuk,
        kode: kodeRekeningFE,
        noNotDis: noSurat[1].nomorSurat,
        ttdSurtTugJabatan: dataTtdSurTug.value.jabatan,
        ttdNotDinNama: ttdNotDis.nama,
        ttdNotDinJabatan: ttdNotDis.jabatan,
        ttdNotDinNip: `NIP. ${ttdNotDis.nip}`,
      });

      // Simpan hasil dokumen ke buffer
      const buffer = doc.getZip().generate({ type: "nodebuffer" });

      // Buat path untuk menyimpan file hasil
      const outputFileName = `SPPD_${Date.now()}.docx`;
      const outputPath = path.join(
        __dirname,
        "../public/output",
        outputFileName
      );

      // Simpan file hasil ke server
      fs.writeFileSync(outputPath, buffer);

      // Kirim file sebagai respons
      res.download(outputPath, outputFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error generating file");
        }
        // Hapus file setelah dikirim
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("Error generating SPPD:", error);
      res.status(500).send("Terjadi kesalahan dalam pembuatan dokumen");
    }
  },
  getSeedPerjalanan: async (req, res) => {
    try {
      const resultDaftarKegiatan = await daftarKegiatan.findAll({
        include: [
          {
            model: daftarSubKegiatan,
            as: "subKegiatan", // Sesuai dengan alias di model
          },
          { model: PPTK },
        ],
      });

      const resultTtdSuratTugas = await ttdSuratTugas.findAll();
      const resultDaftarNomorSurat = await daftarNomorSurat.findAll({
        include: [{ model: jenisSurat, as: "jenisSurat" }],
      });
      const resultJenisTempat = await jenisTempat.findAll();

      return res.status(200).json({
        resultDaftarKegiatan,
        resultTtdSuratTugas,
        resultDaftarNomorSurat,
        resultJenisTempat,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getAllPerjalanan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const time = req.query.time || "ASC";
    const offset = limit * page;
    try {
      const result = await perjalanan.findAll({
        logging: console.log,
        offset: offset,
        limit: limit,
        attributes: [
          "tanggalberangkat",
          "tanggalPulang",
          "tujuan",
          "alasan",
          "id",
        ],
        include: [
          {
            model: pegawai,
            as: "pegawai1",
            attributes: ["id", "nama"],
          },
          {
            model: pegawai,
            as: "pegawai2",
            attributes: ["id", "nama"],
          },
          {
            model: pegawai,
            as: "pegawai3",
            attributes: ["id", "nama"],
          },
          {
            model: pegawai,
            as: "pegawai4",
            attributes: ["id", "nama"],
          },

          { model: kodeRekening },
        ],
      });

      const totalRows = await perjalanan.count();
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
