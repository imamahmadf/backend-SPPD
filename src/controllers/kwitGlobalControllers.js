const {
  pegawai,
  daftarNomorSurat,
  jenisSurat,
  sumberDana,
  kwitGlobal,
  bendahara,
  jenisPerjalanan,
  KPA,
  templateKwitGlobal,
  perjalanan,
  daftarSubKegiatan,
  status,
  tipePerjalanan,
  personil,
  rincianBPD,
  jenisRincianBPD,
  rill,
  tempat,
  dalamKota,
  PPTK,
} = require("../models");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const ImageModule = require("docxtemplater-image-module-free");
let sizeOf;
try {
  sizeOf = require("image-size");
} catch (_) {
  sizeOf = null;
}
const { env } = require("../config");
module.exports = {
  cetakKwitansi: async (req, res) => {
    const {
      data,
      kwitansiGlobalId,
      templateId,
      subKegiatan,
      KPAFE,
      bendaharaFE,
      penerima,
      jenisPerjalananFE,
      totalFE,
      indukUnitKerjaFE,
      verifikasi,
    } = req.body;

    const formatRupiah = (angka) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(angka);

    function formatTerbilang(angka) {
      const satuan = [
        "",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima",
        "Enam",
        "Tujuh",
        "Delapan",
        "Sembilan",
        "Sepuluh",
        "Sebelas",
      ];

      if (angka < 12) {
        return satuan[angka];
      } else if (angka < 20) {
        return formatTerbilang(angka - 10) + " Belas";
      } else if (angka < 100) {
        return (
          formatTerbilang(Math.floor(angka / 10)) +
          " Puluh " +
          formatTerbilang(angka % 10)
        );
      } else if (angka < 200) {
        return "Seratus " + formatTerbilang(angka - 100);
      } else if (angka < 1000) {
        return (
          formatTerbilang(Math.floor(angka / 100)) +
          " Ratus " +
          formatTerbilang(angka % 100)
        );
      } else if (angka < 2000) {
        return "Seribu " + formatTerbilang(angka - 1000);
      } else if (angka < 1000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000)) +
          " Ribu " +
          formatTerbilang(angka % 1000)
        );
      } else if (angka < 1000000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000000)) +
          " Juta " +
          formatTerbilang(angka % 1000000)
        );
      } else if (angka < 1000000000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000000000)) +
          " Milyar " +
          formatTerbilang(angka % 1000000000)
        );
      }
    }
    try {
      const terbilang = formatTerbilang(totalFE) + "Rupiah";

      // Jika verifikasi null/undefined, ambil dari DB; jika masih null, generate dan simpan
      let verifikasiCode = verifikasi;

      if (!verifikasiCode) {
        const randomCode = (
          Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
        ).toUpperCase();
        await kwitGlobal.update(
          { verifikasi: randomCode },
          { where: { id: kwitansiGlobalId } }
        );
        verifikasiCode = randomCode;
      }

      const resultTemplate = await templateKwitGlobal.findOne({
        where: { id: templateId },
        attributes: ["id", "dokumen"],
      });

      // Load file ke PizZip
      // Generate QR Code (contoh: link validasi surat)
      const isProduction = env.NODE_ENV === "production";
      const baseUrl = isProduction
        ? env.APP_BASE_URL_PROD || "https://pena.dinkes.paserkab.go.id"
        : env.APP_BASE_URL_DEV || "http://localhost:5173";
      const qrDataUrl = await QRCode.toDataURL(
        `${baseUrl}/validasi/${verifikasiCode}`
      );
      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public",
        resultTemplate.dokumen
      );

      // Baca file template
      const content = fs.readFileSync(templatePath, "binary");
      function base64DataURLToArrayBuffer(dataURL) {
        const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;
        if (!base64Regex.test(dataURL)) {
          throw new Error("Data URL bukan base64 image yang valid");
        }
        const stringBase64 = dataURL.replace(base64Regex, "");
        return Buffer.from(stringBase64, "base64");
      }

      const imageOpts = {
        getImage: function (tagValue) {
          if (Buffer.isBuffer(tagValue)) return tagValue;
          if (
            typeof tagValue === "string" &&
            tagValue.startsWith("data:image/")
          ) {
            return base64DataURLToArrayBuffer(tagValue);
          }
          return tagValue;
        },
        getSize: function (img, tagValue, tagName) {
          if (tagName === "foto") {
            try {
              const pageWidthPx = 600; // lebar efektif A4 di Word
              const margin = 40; // total margin kiri + kanan (px)
              const targetWidthPx = pageWidthPx - margin;

              let buffer = null;
              if (Buffer.isBuffer(tagValue)) buffer = tagValue;
              else if (
                typeof tagValue === "string" &&
                tagValue.startsWith("data:image/")
              ) {
                const base64 = tagValue.split(",")[1];
                buffer = Buffer.from(base64, "base64");
              }

              if (buffer && sizeOf) {
                const dim = sizeOf(buffer);
                if (dim?.width && dim?.height) {
                  const ratio = targetWidthPx / dim.width;
                  const newWidth = targetWidthPx;
                  const newHeight = Math.round(dim.height * ratio);

                  return [newWidth, newHeight];
                }
              }

              // fallback
              return [pageWidthPx - margin, 800];
            } catch (_) {
              return [560, 800]; // fallback dengan margin
            }
          }

          // default untuk gambar lain (mis. qrCode)
          return [100, 100];
        },
      };
      const imageModule = new ImageModule(imageOpts);
      // Load file ke PizZip
      const zip = new PizZip(content);

      // Inisialisasi Docxtemplater dengan imageModule
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule],
      });
      console.log("QR Code Length:", qrDataUrl.length);

      doc.render({
        bendaharaNama: bendaharaFE.pegawai_bendahara.nama,
        bendaharaNip: bendaharaFE.pegawai_bendahara.nip,
        bendaharaJabatan: bendaharaFE.jabatan,
        // untukPembayaran: bendaharaFE.sumberDana.untukPembayaran || "",
        data,
        KPAJabatan: KPAFE.jabatan,
        indukUnitKerja: indukUnitKerjaFE,
        qrCode: qrDataUrl,
        tanggalBerangkat: "",
        tujuan: "",
        jumlah: "",

        pegawaiNama: penerima.nama,
        pegawaiNip: penerima.nip,

        KPANama: KPAFE.pegawai_KPA.nama,
        KPANip: KPAFE.pegawai_KPA.nip,

        PPTKNama: "",
        PPTKNip: "",

        kodeRekening: subKegiatan.kodeRekening + jenisPerjalananFE.kodeRekening,
        total: formatRupiah(totalFE),
        terbilang,
        // BPD,
        subKegiatan: subKegiatan.subKegiatan,
        jenisPerjalanan: jenisPerjalananFE.jenis,

        // tahun,
      });
      // Simpan hasil dokumen ke buffer
      const buffer = doc.getZip().generate({ type: "nodebuffer" });

      // Buat path untuk menyimpan file hasil
      const outputFileName = `Kwitansi_Global_${Date.now()}.docx`;
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
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getKwitGlobal: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);

    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId);
    const offset = limit * page;

    console.log(req.query, "ini dri frontend");
    try {
      const result = await kwitGlobal.findAll({
        limit,
        where: { unitKerjaId },
        offset,
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
            as: "subKegiatan",
          },
          { model: pegawai, attributes: ["id", "nama"], as: "pegawai" },
          { model: jenisPerjalanan, attributes: ["id", "jenis"] },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
              },
            ],
          },

          {
            model: PPTK,
            as: "PPTK",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_PPTK",
              },
            ],
          },

          {
            model: bendahara,
            as: "bendahara",
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama"],
                as: "pegawai_bendahara",
              },
            ],
            attributes: ["id", "jabatan"],
          },
        ],
      });

      const totalRows = await kwitGlobal.count({
        limit,
        where: { unitKerjaId },
        offset,
      });
      const totalPage = Math.ceil(totalRows / limit);
      const resultKPA = await KPA.findAll({
        where: { unitKerjaId },
        attributes: ["id"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_KPA",
          },
        ],
      });
      const resultBendahara = await bendahara.findAll({
        where: { indukUnitKerjaId },
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama"],
            as: "pegawai_bendahara",
          },
        ],
      });
      const resultDaftarSubKegiatan = await daftarSubKegiatan.findAll({
        attributes: ["id", "subKegiatan", "kodeRekening"],
        where: {
          unitKerjaId,
        },
      });
      const resultTemplate = await templateKwitGlobal.findAll({});
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
      const resultPPTK = await PPTK.findAll({
        where: {
          unitKerjaId,
        },
      });
      return res.status(200).json({
        result,
        resultKPA,
        resultBendahara,
        resultJenisPerjalanan,
        resultTemplate,
        resultDaftarSubKegiatan,
        resultPPTK,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  postKwitGlobal: async (req, res) => {
    const {
      pegawaiId,
      KPAId,
      bendaharaId,
      templateKwitGlobalId,
      jenisPerjalananId,
      unitKerjaId,
      subKegiatanId,
    } = req.body;

    try {
      const result = await kwitGlobal.create({
        pegawaiId,
        KPAId,
        bendaharaId,
        templateKwitGlobalId,
        jenisPerjalananId,
        unitKerjaId,
        subKegiatanId,
        status: "dibuat",
      });
      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getPerjalananKwitGlobal: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.findAll({
        where: { id },
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan", "kodeRekening"],
            as: "subKegiatan",
          },
          { model: pegawai, attributes: ["id", "nama", "nip"], as: "pegawai" },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
          },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_KPA",
              },
            ],
          },
          {
            model: bendahara,
            as: "bendahara",
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_bendahara",
              },
            ],
            attributes: ["id", "jabatan"],
          },
          {
            model: perjalanan,
            attributes: ["id", "untuk", "asal", "noSuratTugas"],
            include: [
              {
                model: personil,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                  },
                  {
                    model: status,
                    attributes: ["id", "statusKuitansi"],
                    // required: true,
                    // where: {
                    //   id: 3,
                    // },
                  },
                  {
                    model: rincianBPD,
                    attributes: ["id", "item", "nilai", "qty"],
                  },
                ],
              },

              {
                model: tempat,
                attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
                include: [
                  {
                    model: dalamKota,
                    as: "dalamKota",
                    attributes: ["id", "nama"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  getAllPerjalanan: async (req, res) => {
    const id = req.params.id;

    try {
      const kwitGlobalId = await kwitGlobal.findOne({ where: { id } });

      const result = await perjalanan.findAll({
        order: [
          ["id", "DESC"],
          [{ model: personil }, "id", "ASC"],
        ],
        where: {
          subKegiatanId: kwitGlobalId.subKegiatanId,
          kwitGlobalId: null,
        },
        attributes: ["id", "asal", "noSuratTugas"],
        include: [
          {
            model: personil,
            required: true,
            include: [
              {
                model: pegawai,
                required: true,
              },
              {
                model: status,
                attributes: ["id", "statusKuitansi"],
                required: true,
                // where: {
                //   id: {
                //     [Op.in]: [2, 3], // ambil data dengan id 1,2,3
                //   },
                // },
              },
              {
                model: rincianBPD,
                attributes: ["id", "item", "nilai", "qty"],
                include: [{ model: jenisRincianBPD, attributes: ["jenis"] }],
              },
            ],
          },
          {
            model: tempat,

            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
            include: [
              {
                model: dalamKota,
                as: "dalamKota",
                attributes: ["id", "nama", "durasi"],
              },
            ],
          },

          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },

          {
            model: jenisPerjalanan,
            where: { id: kwitGlobalId.jenisPerjalananId },
            required: true,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  addPerjalanan: async (req, res) => {
    const { selectedIds, id } = req.body;

    try {
      // Validasi input
      if (
        !selectedIds ||
        !Array.isArray(selectedIds) ||
        selectedIds.length === 0
      ) {
        return res.status(400).json({
          message: "selectedIds harus berupa array yang tidak kosong",
          code: 400,
        });
      }

      if (!id) {
        return res.status(400).json({
          message: "id kwitGlobal harus disediakan",
          code: 400,
        });
      }

      // Update semua perjalanan berdasarkan selectedIds
      const result = await perjalanan.update(
        { kwitGlobalId: id },
        {
          where: {
            id: selectedIds,
          },
        }
      );

      return res.status(200).json({
        message: "Perjalanan berhasil diupdate",
        updatedCount: result[0], // Sequelize mengembalikan array dengan jumlah baris yang diupdate
        result,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  ajukan: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.update(
        {
          status: "diajukan",
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

  verifikasi: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await kwitGlobal.update(
        {
          status: "diterima",
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

  getAllKwitGlobal: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;

    const offset = limit * page;

    console.log(req.query, "ini dri frontend");
    try {
      const result = await kwitGlobal.findAll({
        limit,

        offset,
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
            as: "subKegiatan",
          },
          { model: pegawai, attributes: ["id", "nama"], as: "pegawai" },
          { model: jenisPerjalanan, attributes: ["id", "jenis"] },
          {
            model: KPA,
            as: "KPA",
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
              },
            ],
          },
          {
            model: bendahara,
            as: "bendahara",
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama"],
                as: "pegawai_bendahara",
              },
              {
                model: sumberDana,
              },
            ],
            attributes: ["id", "jabatan"],
          },
        ],
      });

      const totalRows = await kwitGlobal.count({
        limit,

        offset,
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        result,

        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
