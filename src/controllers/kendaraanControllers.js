const {
  rincianBPD,
  kendaraan,
  jenisKendaraan,
  statusKendaraan,
  kondisi,
  daftarUnitKerja,
  indukUnitKerja,
  pegawai,
  sequelize,
  templateAset,
  daftarNomorSurat,
  jenisSurat,
  suratPengantar,
  suratKeluar,
} = require("../models");
const { scrapeData } = require("../services/scraper");
const { sendMessage } = require("../services/waServices");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { Op } = require("sequelize");

// Fungsi helper untuk mengubah format tanggal dari DD-MM-YYYY ke YYYY-MM-DD
const convertDateFormat = (dateString) => {
  if (!dateString) return null;

  // Jika format sudah YYYY-MM-DD, kembalikan as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Jika format DD-MM-YYYY, ubah ke YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  }

  // Jika format lain, coba parse dengan Date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error converting date format:", error);
    return null;
  }
};

module.exports = {
  addKendaraan: async (req, res) => {
    const {
      nomor,
      seri,
      unitKerjaId,
      pegawaiId,
      nomorMesin,
      nomorKontak,
      nomorRangka,
      kondisiId,
      statusId,
      jenisId,
    } = req.body;
    console.log(req.body);
    try {
      // const params = { kt: "KT", nomor: String(nomor), seri };

      // // Scrape data pajak dari eksternal
      // const resultPajak = await scrapeData(params);
      // if (!resultPajak.nopol) {
      //   return res
      //     .status(404)
      //     .json({ message: "Data pajak Kendaraan tidak ditemukan" });
      // }
      // const { nopol, tg_pkb, tg_stnk, total } = resultPajak;
      // Simpan / update pajak

      const result = await kendaraan.create({
        nomor,
        seri,
        unitKerjaId,
        pegawaiId,
        noMesin: nomorMesin,
        noKontak: nomorKontak,
        noRangka: nomorRangka,
        kondisiId,
        statusKendaraanId: statusId,
        jenisKendaraanId: jenisId,
      });
      //   const message = `🚗 *Info Pajak Kendaraan*\n\n• Nopol: ${nopol}\n• Masa PKB: ${tg_pkb}\n• Masa STNK: ${tg_stnk}\n• Total Biaya: ${total}`;
      //   // Kirim WhatsApp
      //   if (nomorKontak) {
      //     await sendMessage(nomorKontak, message);
      //   }

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getDetailKendaraan: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kendaraan.findOne({
        where: { id },
        include: [
          { model: jenisKendaraan },
          { model: statusKendaraan },
          { model: kondisi },
          { model: pegawai },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            foreignKey: "unitKerjaId",
            as: "kendaraanUK",
          },
          { model: suratPengantar },
        ],
      });
      const resultTemplate = await templateAset.findAll({});
      return res.status(200).json({ result, resultTemplate });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKendaraan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const pegawaiId = parseInt(req.query.pegawaiId);
    const nomor = parseInt(req.query.nomor) || "";
    const whereCondition = { nomor: { [Op.like]: "%" + nomor + "%" } };

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (pegawaiId) {
      whereCondition.pegawaiId = pegawaiId;
    }
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const kendaraanList = await kendaraan.findAll({
        limit,
        where: whereCondition,
        offset,
        include: [
          { model: jenisKendaraan },
          { model: statusKendaraan },
          { model: kondisi },
          { model: pegawai },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            foreignKey: "unitKerjaId",
            as: "kendaraanUK",
          },
        ],
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "nomor",
          "seri",
          "noKontak",
          "unitKerjaId",
          "pegawaiId",

          "noRangka",
          "noMesin",
          "kondisiId",
          "statusKendaraanId",
          "jenisKendaraanId",
          "tgl_pkb",
          "tg_stnk",
          "total",
          "foto",
        ],
      });

      const totalRows = await kendaraan.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);
      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        success: true,
        result: kendaraanList,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },

  getSeedKendaraan: async (req, res) => {
    try {
      // Ambil data dari tabel lokal
      const [resultJenis, resultStatus, resultKondisi] = await Promise.all([
        jenisKendaraan.findAll(),
        statusKendaraan.findAll(),
        kondisi.findAll(),
      ]);

      const resultUnitKerja = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });

      return res.status(200).json({
        success: true,

        jenis: resultJenis,
        status: resultStatus,
        kondisi: resultKondisi,
        unitKerja: resultUnitKerja,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data seed kendaraan",
        error: err.toString(),
      });
    }
  },

  cekPajak: async (req, res) => {
    console.log("BODY:", req.body); // <-- debug
    try {
      const { kt, nomor, seri, id } = req.body;
      const params = { kt, nomor, seri, id };
      const result = await scrapeData(params);
      if (!result.nopol) {
        return res
          .status(404)
          .json({ message: "Data tidak ditemukan di SIMPATOR" });
      }
      console.log(result);

      // Konversi format tanggal sebelum disimpan ke database
      const convertedTglPkb = convertDateFormat(result.tg_pkb);
      const convertedTgStnk = convertDateFormat(result.tg_stnk);

      // Logika untuk menentukan statusKendaraanId berdasarkan tanggal PKB
      let statusKendaraanId = null;
      if (convertedTglPkb) {
        const today = new Date();
        const pkbDate = new Date(convertedTglPkb);

        // Reset waktu ke 00:00:00 untuk perbandingan yang akurat
        today.setHours(0, 0, 0, 0);
        pkbDate.setHours(0, 0, 0, 0);

        const currentYear = today.getFullYear();
        const pkbYear = pkbDate.getFullYear();

        if (pkbDate < today) {
          // PKB sudah lewat dari hari ini (Menunggak)
          statusKendaraanId = 3;
        } else if (pkbYear > currentYear) {
          // PKB di tahun depan (Lunas)
          statusKendaraanId = 1;
        } else {
          // PKB belum lewat tapi masih di tahun yang sama (Belum Dibayarkan)
          statusKendaraanId = 2;
        }

        console.log(
          `Tanggal PKB: ${convertedTglPkb}, Tahun PKB: ${pkbYear}, Tahun Sekarang: ${currentYear}, Status: ${statusKendaraanId}`
        );
      }

      await kendaraan.upsert({
        id,
        tgl_pkb: convertedTglPkb,
        tg_stnk: convertedTgStnk,
        total: result.total,
        ...(statusKendaraanId && { statusKendaraanId }),
      });

      res.json({
        success: true,
        data: result,
        statusKendaraanId,
        message: "Data kendaraan Berhasil diperbaharui",
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Terjadi kesalahan", error: err.message });
    }
  },
  getKendaraanIndukUnitKerja: async (req, res) => {
    const id = req.params.id;
    console.log(id, "cekkk IDDD");
    try {
      const result = await kendaraan.findAll({
        include: [
          { model: jenisKendaraan },
          { model: statusKendaraan },
          { model: kondisi },
          { model: pegawai },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja", "indukUnitKerjaId"],
            where: { indukUnitKerjaId: id },
            foreignKey: "unitKerjaId",
            as: "kendaraanUK",
          },
        ],
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "nomor",
          "seri",
          "noKontak",
          "unitKerjaId",
          "pegawaiId",
          "noRangka",
          "noMesin",
          "kondisiId",
          "statusKendaraanId",
          "jenisKendaraanId",
          "tgl_pkb",
          "tg_stnk",
          "total",
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  cetakSurat: async (req, res) => {
    const formatTanggalIndonesia = (date) => {
      const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const tanggal = date.getDate().toString().padStart(2, "0");
      const bulanIndex = date.getMonth();
      const tahun = date.getFullYear();

      return `${tanggal} ${bulan[bulanIndex]} ${tahun}`;
    };
    let transaction;
    console.log(req.body);
    const {
      nomorRangka,
      nomorMesin,
      unitKerja,
      plat,
      jenis,
      tanggal,
      kendaraanId,
      jenisKendaraan,
    } = req.body;
    try {
      transaction = await sequelize.transaction();

      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: 1 },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],

        transaction, // Letakkan dalam objek konfigurasi yang sama
      });
      const noLoket = parseInt(dbNoSurat.nomorLoket) + 1;

      const templateSurat = await templateAset.findAll({}, transaction);

      const nomorSurat = templateSurat[0].nomorSurat.replace("NOMOR", noLoket);

      await daftarNomorSurat.update(
        { nomorLoket: noLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSurat.id }, transaction }
      );

      const result = await suratPengantar.create(
        {
          noLoket,
          kendaraanId,
        },
        transaction
      );

      const resultSuratKeluar = await suratKeluar.create(
        {
          nomor: nomorSurat,
          Perihal: "Surat Pengantar Kendaraan Bermotor plat" + plat,
          // tanggalSurat: tanggalPengajuan,
          tujuan: "Kantor Samsat",
          indukUnitKerjaId: 1,
        },
        transaction
      );

      const templatePath = path.join(
        __dirname,
        "../public",
        templateSurat[0].dokumen
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

      // Buat tanggal surat dalam format Indonesia
      const tanggalSurat = formatTanggalIndonesia(new Date(tanggal));

      doc.render({
        nomorSurat,
        nomorRangka,
        nomorMesin,
        unitKerja,
        tanggalSurat,
        jenisKendaraan,
        plat,
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
      if (transaction) await transaction.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  postFoto: async (req, res) => {
    const id = parseInt(req.body.id);
    console.log(req.body);
    console.log(id, "ECEKKKKKKK");
    try {
      const filePath = "kendaraan";
      let foto = null;
      if (req.file) {
        // console.log("GGGGGGGGGGGGGGGGGGGGGGGGGG");
        const { filename } = req.file;
        foto = `/${filePath}/${filename}`;
      }
      const result = await kendaraan.update(
        {
          foto,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  editKendaraan: async (req, res) => {
    try {
      const {
        nomor,
        noRangka,
        noKontak,
        noMesin,
        tgl_pkb,
        tg_stnk,
        jenisKendaraanId,
        statusKendaraanId,
        kondisiId,
      } = req.body;
      const id = req.params.id;
      console.log(req.body);
      const result = await kendaraan.update(
        {
          nomor,
          noRangka,
          noMesin,
          tgl_pkb,
          tg_stnk,
          jenisKendaraanId,
          statusKendaraanId,
          kondisiId,
          noKontak,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
