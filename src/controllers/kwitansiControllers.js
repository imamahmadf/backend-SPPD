const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  rincianBPD,
  perjalanan,
  personil,
  jenisRincianBPD,
  tempat,
  jenisTempat,
  PPTK,
  rill,
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarKegiatan,
  ttdSuratTugas,
  jenisPerjalanan,
} = require("../models");

const { Op } = require("sequelize");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");

module.exports = {
  postRampung: async (req, res) => {
    const { personilId, nama, jumlah, harga, jenisId } = req.body;
    console.log(req.body);
    try {
      const result = await rincianBPD.create({
        personilId,
        nama,
        harga,
        jenisId,
        jumlah,
      });

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getRampung: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await personil.findOne({
        where: { id },
        include: [
          {
            model: pegawai,
            include: [
              { model: daftarPangkat, as: "daftarPangkat" },
              { model: daftarGolongan, as: "daftarGolongan" },
            ],
          },
          {
            model: rincianBPD,
            attributes: ["id", "nama", "harga", "jumlah", "jenisId"],
            include: [
              { model: jenisRincianBPD, attributes: ["jenis"] },
              { model: rill },
            ],
          },
          {
            model: perjalanan,
            attributes: ["id", "asal", "tanggalPengajuan", "untuk"],
            include: [
              {
                model: tempat,
                attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
              },
              {
                model: jenisPerjalanan,
              },
              {
                model: daftarSubKegiatan,
                attributes: ["id", "kodeRekening", "subKegiatan"],
                include: [
                  {
                    model: daftarKegiatan,
                    attributes: ["id", "kodeRekening", "kegiatan"],
                    as: "kegiatan",
                    include: [{ model: PPTK }],
                  },
                ],
              },
              {
                model: ttdSuratTugas,
                attributes: ["nama", "id", "nip", "jabatan"],
              },
            ],
          },
        ],
      });

      const jenisRampung = await jenisRincianBPD.findAll();

      return res.status(200).json({ result, jenisRampung });
    } catch (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  cetakKwitansi: async (req, res) => {
    console.log(req.body);
    const {
      id,
      nomorSPD,
      pegawaiNama,
      pegawaiNip,
      pegawaiJabatan,
      PPTKNama,
      PPTKNip,
      untuk,
      rincianBPD,
    } = req.body;

    try {
      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public/template/kuitansi.docx"
      );

      // Baca file template
      const content = fs.readFileSync(templatePath, "binary");

      // Load file ke PizZip
      const zip = new PizZip(content);

      // Inisialisasi Docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

 

      // Masukkan data ke dalam template
      doc.render({
        nomorSPD,
        untuk,
        tanggalBerangkat: "",
        tujuan: "",
        jumlah: "",
        bendaharaNama: "",
        bendaharaNip: "",
        pegawaiNama,
        pegawaiNip,
        pegawaiJabatan,
        pejabatNama: "",
        pejabatNip: "",
        tanggalPengajuan: "",
        PPTKNama,
        PPTKNip,
        tahun: "",
        nomorRekening: "",
        total: "",
        terbilang: "",
        rincianBPD,
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
      res.download(outputPath, outputFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error generating file");
        }
        // Hapus file setelah dikirim
        fs.unlinkSync(outputPath);
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
