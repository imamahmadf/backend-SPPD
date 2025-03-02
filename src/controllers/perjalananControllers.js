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
  personil,
  jenisTempat,
  sequelize,
  tempat,
  jenisPerjalanan,
  daftarGolongan,
  daftarPangkat,
} = require("../models");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");

module.exports = {
  postNotaDinas: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        pegawai,
        tanggalPengajuan,
        kodeRekeningFE,
        sumber,
        untuk,
        dataTtdSurTug,
        ttdNotDis,
        asal,
        perjalananKota,
        subKegiatanId,
        jenis,
      } = req.body;

      console.log(req.body.pegawai);

      // Ambil satu data nomor surat berdasarkan id = 2
      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { id: 2 },
        transaction, // Letakkan dalam objek konfigurasi yang sama
      });

      // Pastikan dbNoSurat ditemukan sebelum digunakan
      if (!dbNoSurat) {
        throw new Error("Data nomor surat tidak ditemukan.");
      }

      // Update nomor loket
      const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;

      // Buat nomor baru dengan mengganti "NOMOR" dengan nomorLoket
      const nomorBaru = dbNoSurat.nomorSurat.replace(
        "NOMOR",
        nomorLoket.toString()
      );

      // Update nomor loket ke database
      await daftarNomorSurat.update(
        { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: 2 }, transaction }
      );

      // Simpan data perjalanan
      const dbPerjalanan = await perjalanan.create(
        {
          untuk,
          noNotaDinas: nomorBaru,
          asal,
          tanggalPengajuan,
          subKegiatanId,
          ttdSuratTugasId: dataTtdSurTug.value.id,
          jenisId: jenis.id,
        },
        { transaction }
      );

      var dataPegawai = pegawai.map((item, index) => ({
        nama: item.value.nama,
        nip: item.value.nip,
        jumlahPersonil: "",
        index: index + 1,
      }));

      dataPegawai[0].jumlahPersonil = "Jumlah Personil";

      // Buat data personil
      const dataPersonil = pegawai.map((item) => ({
        perjalananId: dbPerjalanan.id,
        pegawaiId: parseInt(item.value.id),
      }));

      await personil.bulkCreate(dataPersonil, { transaction });

      // Buat data kota tujuan
      const dataKota = perjalananKota.map((item) => ({
        perjalananId: dbPerjalanan.id,
        tempat: item.kota,
        tanggalBerangkat: item.tanggalBerangkat,
        tanggalPulang: item.tanggalPulang,
      }));

      await tempat.bulkCreate(dataKota, { transaction });

      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public/template/notaDinas.docx"
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
        dataPegawai,
        tanggalPengajuan,
        untuk,
        kode: kodeRekeningFE,
        noNotDis: nomorBaru,
        ttdSurtTugJabatan: dataTtdSurTug.value.jabatan,
        ttdNotDinNama: ttdNotDis.nama,
        ttdNotDinJabatan: ttdNotDis.jabatan,
        ttdNotDinNip: `NIP. ${ttdNotDis.nip}`,
        sumber,
        jenis: jenis.jenis,
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

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
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
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
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
        resultJenisPerjalanan,
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
    const limit = parseInt(req.query.limit) || 15;

    const time = req.query.time || "ASC";
    const offset = limit * page;
    try {
      const result = await perjalanan.findAll({
        offset: offset,
        limit: limit,
        attributes: [
          "id",
          "untuk",
          "asal",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
        ],
        include: [
          {
            model: personil,
            include: [
              {
                model: pegawai,
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                ],
              },
            ],
          },
          {
            model: tempat,
            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
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
  postSuratTugas: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        asal,
        kode,
        personilFE,
        ttdSurTug,
        id,
        tanggalPengajuan,
        tempat,
        untuk,
        ttdSurTugJabatan,
        ttdSurTugNama,
        ttdSurTugNip,
        noNotaDinas,
        noSuratTugas,
      } = req.body;
      console.log(personilFE);

      // Path file template
      // Ambil satu data nomor surat berdasarkan id = 1
      var nomorBaru = noSuratTugas;
      let noSpd;
      if (!noSuratTugas) {
        const dbNoSurat = await daftarNomorSurat.findAll({
          transaction, // Letakkan dalam objek konfigurasi yang sama
        });

        // Pastikan dbNoSurat ditemukan sebelum digunakan
        if (!dbNoSurat) {
          throw new Error("Data nomor surat tidak ditemukan.");
        }

        const nomorLoket = parseInt(dbNoSurat[0].nomorLoket) + 1;

        nomorBaru = dbNoSurat[0].nomorSurat.replace(
          "NOMOR",
          nomorLoket.toString()
        );

        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: 1 }, transaction }
        );

        // Update data perjalanan
        await perjalanan.update(
          { noSuratTugas: nomorBaru },
          { where: { id }, transaction }
        );

        let nomorAwalSPD = parseInt(dbNoSurat[2].nomorLoket);

        noSpd = personilFE.map((item, index) => ({
          nomorSPD: dbNoSurat[0].nomorSurat.replace(
            "NOMOR",
            (nomorAwalSPD + index + 1).toString()
          ),
        }));

        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: 3 }, transaction }
        );

        for (const [index, item] of personilFE.entries()) {
          await personil.update(
            {
              nomorSPD: dbNoSurat[0].nomorSurat.replace(
                "NOMOR",
                (nomorAwalSPD + index + 1).toString()
              ),
            },
            {
              where: { id: item.id }, // Pastikan ada kriteria unik
            }
          );
        }
      } else {
        noSpd = personilFE.map((item, index) => ({
          nomorSPD: item.nomorSPD,
        }));
      }

      var dataPegawai = personilFE.map((item, index) => ({
        nama: item.pegawai.nama,
        nip: item.pegawai.nip,
        jabatan: item.pegawai.jabatan,
        golongan: item.pegawai.daftarGolongan.golongan,
        no: index + 1,
        kepada: "",
        a: "",
      }));

      dataPegawai[0].kepada = "kepada";
      dataPegawai[0].a = ":";

      const templatePath = path.join(
        __dirname,
        "../public/template/suratTugas.docx"
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
      console.log(nomorBaru);
      // Masukkan data ke dalam template
      doc.render({
        asal,
        kode,
        noNotaDinas,
        noSuratTugas: nomorBaru,
        ttdSurTug,
        id,
        tanggalPengajuan,
        tempat,
        untuk,
        ttdSurTugJabatan,
        ttdSurTugNama,
        ttdSurTugNip,
        dataPegawai,
        pegawai1Nama: personilFE[0]?.pegawai?.nama,
        pegawai2Nama: personilFE[1]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai3Nama: personilFE[2]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai4Nama: personilFE[3]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai5Nama: personilFE[4]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        noSpd1: noSpd[0]?.nomorSPD || "TIDAK ADA NOMOR",

        noSpd2: noSpd[1]?.nomorSPD || "TIDAK ADA NOMOR",

        noSpd3: noSpd[2]?.nomorSPD || "TIDAK ADA NOMOR",

        noSpd4: noSpd[3]?.nomorSPD || "TIDAK ADA NOMOR",

        noSpd5: noSpd[4]?.nomorSPD || "TIDAK ADA NOMOR",
        pegawai1Golongan:
          personilFE[0]?.pegawai?.daftarGolongan.golongan ||
          "TIDAK ADA GOLONGAN !!",
        pegawai2Golongan:
          personilFE[1]?.pegawai?.daftarGolongan.golongan ||
          "TIDAK ADA GOLONGAN !!",
        pegawai3Golongan:
          personilFE[2]?.pegawai?.daftarGolongan.golongan ||
          "TIDAK ADA GOLONGAN !!",
        pegawai4Golongan:
          personilFE[3]?.pegawai?.daftarGolongan.golongan ||
          "TIDAK ADA GOLONGAN !!",
        pegawai5Golongan:
          personilFE[4]?.pegawai?.daftarGolongan.golongan ||
          "TIDAK ADA GOLONGAN !!",
        pegawai1Jabatan:
          personilFE[0]?.pegawai?.jabatan || "TIDAK ADA JABATAN !",
        pegawai2Jabatan:
          personilFE[1]?.pegawai?.jabatan || "TIDAK ADA JABATAN !",
        pegawai3Jabatan:
          personilFE[2]?.pegawai?.jabatan || "TIDAK ADA JABATAN !",
        pegawai4Jabatan:
          personilFE[3]?.pegawai?.jabatan || "TIDAK ADA JABATAN !",
        pegawai5Jabatan:
          personilFE[4]?.pegawai?.jabatan || "TIDAK ADA JABATAN !",
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
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getDetailPerjalanan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await perjalanan.findOne({
        where: { id },
        attributes: [
          "id",
          "untuk",
          "asal",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
        ],
        include: [
          {
            model: personil,
            include: [
              {
                model: pegawai,
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                ],
              },
            ],
          },
          {
            model: tempat,
            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
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
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
