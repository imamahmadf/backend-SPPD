const {
  perjalanan,
  nomorSurat,
  kodeRekening,
  pegawai,
  ttdNotDis,
  ttdSurTug,
} = require("../models");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");

module.exports = {
  postPerjalanan: async (req, res) => {
    try {
      // Ambil data dari request body
      const {
        pegawai,
        tanggalBerangkat,
        tanggalPulang,
        tujuan,
        kodeRekeningFE,
        noSurat,
        dataTtdNotDis,
        dataTtdSurTug,
      } = req.body;

      const dbPerjalanan = await perjalanan.create({
        pegawaiId1: pegawai[0].value.id,
        pegawaiId2: pegawai[1].value.id,
        pegawaiId3: pegawai[2].value.id,
        pegawaiId4: pegawai[3].value.id,
        ttdSurTugId: dataTtdSurTug.id,
        ttdNotDisId: dataTtdNotDis.id,
        noSurTug: noSurat[0].nomor,
        noNotDis: noSurat[1].nomor,
        noSpd1: noSurat[2].nomor,
        noSpd2: noSurat[2].nomor,
        noSpd3: noSurat[2].nomor,
        noSpd4: noSurat[2].nomor,
        tanggalBerangkat,
        tanggalPulang,
        tujuan,
        kodeRekeningId: kodeRekeningFE.value.id,
      });

      // Path file template
      const templatePath = path.join(__dirname, "../public/template/SPPD.docx");

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
        pegawai1Nama: pegawai[0].value.nama,
        pegawai1Pangkat: pegawai[0].value.pangkat.nama,
        pegawai1Nip: pegawai[0].value.nip,
        pegawai1Jabatan: pegawai[0].value.jabatan,

        pegawai2Nama: pegawai[1].value.nama,
        pegawai2Pangkat: pegawai[1].value.pangkat.nama,
        pegawai2Nip: pegawai[1].value.nip,
        pegawai2Jabatan: pegawai[1].value.jabatan,

        pegawai3Nama: pegawai[2].value.nama,
        pegawai3Pangkat: pegawai[2].value.pangkat.nama,
        pegawai3Nip: pegawai[2].value.nip,
        pegawai3Jabatan: pegawai[2].value.jabatan,

        pegawai4Nama: pegawai[3].value.nama,
        pegawai4Pangkat: pegawai[3].value.pangkat.nama,
        pegawai4Nip: pegawai[3].value.nip,
        pegawai4Jabatan: pegawai[3].value.jabatan,

        tanggalBerangkat,
        tanggalPulang,
        tujuan,
        kode: kodeRekeningFE.value.kode,
        sumber: kodeRekeningFE.value.sumber,
        noSurTug: noSurat[0].nomor,
        noNotDis: noSurat[1].nomor,
        noSpd1: noSurat[2].nomor,

        ttdSurTugJabatan: dataTtdSurTug.jabatan,
        ttdSurTugNama: dataTtdSurTug.nama,
        ttdSurTugNip: dataTtdSurTug.nip,

        ttdNotDisJabatan: dataTtdNotDis.jabatan,
        ttdNotDisNama: dataTtdNotDis.nama,
        ttdNotDisNip: dataTtdNotDis.nip,
        // tanggal_berangkat,
        // tanggal_kembali,
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
      const resultNomorSurat = await nomorSurat.findAll({});
      const resultKodeRekening = await kodeRekening.findAll();
      const resultTtdSurTug = await ttdSurTug.findAll();
      const resultTtdNotDis = await ttdNotDis.findAll();
      return res.status(200).json({
        resultNomorSurat,
        resultKodeRekening,
        resultTtdNotDis,
        resultTtdSurTug,
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
