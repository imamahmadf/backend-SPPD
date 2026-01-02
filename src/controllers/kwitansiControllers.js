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
  templateKeuangan,
  PPTK,
  rill,
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarKegiatan,
  ttdSuratTugas,
  dalamKota,
  jenisPerjalanan,
  KPA,
  bendahara,
  status,
  sequelize,
  pelayananKesehatan,
  uangHarian,
  fotoPerjalanan,
  sumberDana,
} = require("../models");
const { emitNotifikasiPersonil } = require("./notifikasiControllers");
const { Op, where } = require("sequelize");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const { exec } = require("child_process");
const QRCode = require("qrcode");
const { generateQrWithLogo } = require("../lib/qrcodeWithLogo");
const ImageModule = require("docxtemplater-image-module-free");
let sizeOf;
try {
  sizeOf = require("image-size");
} catch (_) {
  sizeOf = null;
}
module.exports = {
  postRampung: async (req, res) => {
    const { personilId, item, qty, nilai, satuan, jenisId } = req.body;
    // console.log(req.file.filename);
    try {
      const filePath = "bukti";
      let bukti = null;
      if (req.file) {
        // console.log("GGGGGGGGGGGGGGGGGGGGGGGGGG");
        const { filename } = req.file;
        bukti = `/${filePath}/${filename}`;
      }
      const result = await rincianBPD.create({
        personilId,
        item,
        nilai,
        jenisId,
        qty,
        satuan,
        bukti,
      });

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  postBuktiKegiatan: async (req, res) => {
    const perjalananId = parseInt(req.body.perjalananId);
    const tanggal = req.body.tanggal ? new Date(req.body.tanggal) : new Date();

    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("PerjalananId:", perjalananId);
    console.log("Tanggal:", tanggal);

    try {
      // Validasi perjalananId
      if (!perjalananId || isNaN(perjalananId)) {
        return res.status(400).json({
          message: "perjalananId is required and must be a valid number",
          code: 400,
        });
      }

      // Verifikasi perjalanan ada (hanya mengambil id untuk menghindari masalah kolom)
      const perjalananExists = await perjalanan.findOne({
        where: { id: perjalananId },
        attributes: ["id"],
      });

      if (!perjalananExists) {
        return res.status(404).json({
          message: `Perjalanan dengan ID ${perjalananId} tidak ditemukan`,
          code: 404,
        });
      }

      // Filter hanya file yang memiliki mimetype image
      const imageFiles = req.files
        ? req.files.filter(
            (file) => file.mimetype && file.mimetype.startsWith("image/")
          )
        : [];

      if (imageFiles.length === 0) {
        return res.status(400).json({
          message: "No image files uploaded",
          code: 400,
        });
      }

      const filePath = "bukti";
      const results = [];

      // Loop setiap file dan simpan ke tabel fotoPerjalanan
      for (const file of imageFiles) {
        const foto = `/${filePath}/${file.filename}`;

        console.log("Creating fotoPerjalanan with:", {
          foto,
          perjalananId,
          tanggal,
        });

        try {
          const result = await fotoPerjalanan.create({
            foto,
            perjalananId,
            tanggal,
          });

          console.log("FotoPerjalanan created successfully:", result.toJSON());
          results.push(result);
        } catch (createError) {
          console.error("Error creating fotoPerjalanan:", createError);
          console.error("Error details:", {
            name: createError.name,
            message: createError.message,
            errors: createError.errors,
          });
          throw createError;
        }
      }

      return res.status(200).json({
        message: "Foto berhasil disimpan",
        data: results,
        count: results.length,
      });
    } catch (err) {
      console.error("Error in postBuktiKegiatan:", err);
      console.error("Error stack:", err.stack);
      return res.status(500).json({
        message: err.message || err.toString(),
        code: 500,
        error: err.name,
      });
    }
  },
  getRampung: async (req, res) => {
    const id = req.params.id;
    const unitKerjaId = req.body.unitKerjaId || 1;
    console.log(req.body);
    try {
      const daftarRill = await rill.findAll({
        include: [
          {
            model: rincianBPD,
            required: true,
            include: [{ model: personil, where: { id }, required: true }],
          },
        ],
      });

      // const dataBendahara = await bendahara.findAll({
      //   where: { unitKerjaId },
      //   attributes: ["id", "jabatan"],
      //   include: [
      //     {
      //       model: pegawai,
      //       attributes: ["id", "nama", "nip"],
      //       as: "pegawai_bendahara",
      //     },
      //   ],
      // });
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
            attributes: [
              "id",
              "item",
              "nilai",
              "qty",
              "jenisId",
              "satuan",
              "bukti",
            ],
            include: [
              { model: jenisRincianBPD, attributes: ["jenis"] },
              { model: rill },
            ],
          },
          {
            model: perjalanan,
            attributes: [
              "id",
              "asal",
              "tanggalPengajuan",
              "untuk",
              "pic",
              "noSuratTugas",
              "undangan",
            ],
            include: [
              {
                model: tempat,
                attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
                include: [
                  {
                    model: dalamKota,
                    as: "dalamKota",
                    attributes: [
                      "id",
                      "uangTransport",
                      "nama",
                      "durasi",
                      "indukUnitKerjaId",
                    ],
                  },
                ],
              },
              {
                model: fotoPerjalanan,
                attributes: ["id", "foto", "perjalananId", "tanggal"],
                required: false, // Left join agar perjalanan tetap muncul meski tidak ada foto
              },
              { model: jenisPerjalanan },
              { model: pelayananKesehatan },
              {
                model: bendahara,
                attributes: ["id", "jabatan"],
                paranoid: false, // ✅ tambahkan ini
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip"],
                    as: "pegawai_bendahara",
                  },
                  {
                    model: sumberDana,
                    attributes: [
                      "id",
                      "sumber",
                      "untukPembayaran",
                      "kalimat1",
                      "kalimat2",
                    ],
                  },
                ],
              },
              {
                model: daftarSubKegiatan,
                attributes: ["id", "kodeRekening", "subKegiatan"],
              },
              {
                model: ttdSuratTugas,
                attributes: ["id", "jabatan"],
                paranoid: false, // ✅ tambahkan ini
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                    as: "pegawai",
                  },
                ],
              },
              {
                model: PPTK,
                attributes: ["id", "jabatan"],
                paranoid: false, // ✅ tambahkan ini
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip"],
                    as: "pegawai_PPTK",
                  },
                ],
              },
              {
                model: KPA,
                attributes: ["id", "jabatan"],
                paranoid: false, // ✅ tambahkan ini
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
                attributes: ["id", "jabatan"],
                paranoid: false, // ✅ tambahkan ini
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip"],
                    as: "pegawai_bendahara",
                  },
                ],
              },
            ],
          },
          {
            model: status,
            attributes: ["id", "statusKuitansi"],
          },
        ],
        order: [[rincianBPD, "jenisId", "ASC"]],
      });

      const jenisRampung = await jenisRincianBPD.findAll();
      const resultUangHarian = await uangHarian.findAll();
      const template = await templateKeuangan.findAll({
        attributes: ["id", "nama"],
      });

      return res
        .status(200)
        .json({ result, jenisRampung, daftarRill, template, resultUangHarian });
    } catch (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  cetakKwitansi: async (req, res) => {
    // console.log(req.body.rincianBPD, "DRI DEPAN");
    const {
      id,
      nomorSPD,
      nomorST,
      pegawaiNama,
      pegawaiNip,
      pegawaiJabatan,
      PPTKNama,
      KPANama,
      KPANip,
      PPTKNip,
      untuk,
      rincianBPD,
      kodeRekening,
      indukUnitKerja,
      tanggalPengajuan,
      totalDurasi,
      tempat,
      jenis,
      jenisPerjalanan,
      dataBendahara,
      subKegiatan,
      KPAJabatan,
      tahun,
      templateId,
      foto,
    } = req.body;
    console.log(req.body.templateId);

    const formatTanggal = (tanggal) => {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };
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

    const BPD = rincianBPD.map((item, index) => ({
      no: index + 1,
      jenis: item.jenisRincianBPD.jenis,
      satuan: item.satuan,
      item: item.item,
      qty: item.qty,
      harga: formatRupiah(item.nilai || 0),
      jumlah: formatRupiah(item.qty * item.nilai || 0),
    }));

    const Rill = rincianBPD
      .filter((item) => item.jenisId === 5) // Filter berdasarkan jenisId
      .flatMap((item) => item.rills) // Langsung flatten tanpa map().flat()
      .map((item, index) => ({
        ...item,
        nilai: formatRupiah(item.nilai),
        no: index + 1,
      })); // Tambahkan nomor urut
    // console.log(Rill, "ini DATA RILLLLLLLLLLL");
    // Hitung totalRill dari nilai Rill
    const totalRill = formatRupiah(
      Rill.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.nilai.replace(/[^0-9,-]+/g, "").replace(",", ".")),
        0
      )
    );

    const total = formatRupiah(
      rincianBPD.reduce((sum, item) => sum + (item.qty * item.nilai || 0), 0)
    );

    const terbilang =
      formatTerbilang(
        rincianBPD.reduce((sum, item) => sum + (item.qty * item.nilai || 0), 0)
      ) + "Rupiah";

    try {
      const resultTemplate = await templateKeuangan.findOne({
        where: { id: templateId },
        attributes: ["id", "template"],
      });
      // Path file template
      const templatePath = path.join(
        __dirname,
        "../public",
        resultTemplate.template
      );

      // Baca file template
      const content = fs.readFileSync(templatePath, "binary");

      // Generate QR Code dengan logo tengah
      const logoPath = path.join(
        __dirname,
        "../public/template-keuangan/penaLogo.png"
      );
      const qrDataUrl = await generateQrWithLogo(
        `https://pena.dinkes.paserkab.go.id/validasi/${id}`,
        { sizePx: 500, logoPath, logoScale: 0.22 }
      );

      // Siapkan array foto dari fotoPerjalanan untuk loop di template
      // Template Word harus menggunakan: {#foto}{%foto}{/foto}
      let fotoArray = [];
      try {
        if (foto && Array.isArray(foto) && foto.length > 0) {
          // Konversi semua foto dalam array menjadi data URL
          for (const fotoItem of foto) {
            const fotoPath = fotoItem?.foto || fotoItem;

            // Tentukan path file foto di server
            const normalizedFoto =
              typeof fotoPath === "string" ? fotoPath.trim() : "";
            if (!normalizedFoto) continue;

            const isPath =
              normalizedFoto.startsWith("/") || normalizedFoto.startsWith("\\");
            const fullFotoPath = isPath
              ? path.join(
                  __dirname,
                  "../public",
                  normalizedFoto.replace(/[\\/]+/g, "/")
                )
              : path.join(__dirname, "../public/bukti", normalizedFoto);

            console.log("[FOTO] processing:", normalizedFoto);
            console.log("[FOTO] try path:", fullFotoPath);

            let finalFotoPath = fullFotoPath;
            if (!fs.existsSync(finalFotoPath)) {
              const altPath = path.join(
                __dirname,
                "../public/pegawai",
                normalizedFoto
              );
              console.log("[FOTO] fallback path:", altPath);
              if (fs.existsSync(altPath)) finalFotoPath = altPath;
            }

            if (fs.existsSync(finalFotoPath)) {
              const ext = path.extname(finalFotoPath).toLowerCase();
              const mime =
                ext === ".png"
                  ? "image/png"
                  : ext === ".jpg" || ext === ".jpeg"
                  ? "image/jpeg"
                  : "image/jpeg";
              const fileBuf = fs.readFileSync(finalFotoPath);
              const base64 = fileBuf.toString("base64");
              const fotoDataUrl = `data:${mime};base64,${base64}`;
              fotoArray.push(fotoDataUrl);
              console.log(
                "[FOTO] loaded:",
                normalizedFoto,
                "size:",
                fileBuf.length
              );
            } else {
              console.log("[FOTO] not found:", normalizedFoto);
            }
          }
        } else if (foto && typeof foto === "string") {
          // Backward compatibility: jika foto masih string (untuk kasus lama)
          const normalizedFoto = foto.trim();
          const isPath =
            normalizedFoto.startsWith("/") || normalizedFoto.startsWith("\\");
          const fotoPath = isPath
            ? path.join(
                __dirname,
                "../public",
                normalizedFoto.replace(/[\\/]+/g, "/")
              )
            : path.join(__dirname, "../public/bukti", normalizedFoto);

          console.log("[FOTO] input (string):", normalizedFoto);
          console.log("[FOTO] try path:", fotoPath);

          let finalFotoPath = fotoPath;
          if (!fs.existsSync(finalFotoPath)) {
            const altPath = path.join(
              __dirname,
              "../public/pegawai",
              normalizedFoto
            );
            console.log("[FOTO] fallback path:", altPath);
            if (fs.existsSync(altPath)) finalFotoPath = altPath;
          }

          if (fs.existsSync(finalFotoPath)) {
            const ext = path.extname(fotoPath).toLowerCase();
            const mime =
              ext === ".png"
                ? "image/png"
                : ext === ".jpg" || ext === ".jpeg"
                ? "image/jpeg"
                : "image/jpeg";
            const fileBuf = fs.readFileSync(finalFotoPath);
            const base64 = fileBuf.toString("base64");
            fotoArray.push(`data:${mime};base64,${base64}`);
            console.log("[FOTO] loaded size:", fileBuf.length, " mime:", mime);
          } else {
            console.log("[FOTO] not found on disk");
          }
        }

        // Filter array untuk memastikan hanya berisi string data URL yang valid
        fotoArray = fotoArray.filter(
          (foto) =>
            foto && typeof foto === "string" && foto.startsWith("data:image/")
        );

        console.log("[FOTO] total loaded:", fotoArray.length);
      } catch (err) {
        // Abaikan jika foto tidak tersedia
        console.error("[FOTO] error:", err);
      }

      // Konversi base64 ke buffer
      function base64DataURLToArrayBuffer(dataURL) {
        if (!dataURL || typeof dataURL !== "string") {
          return null;
        }
        const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;
        if (!base64Regex.test(dataURL)) {
          throw new Error("Data URL bukan base64 image yang valid");
        }
        const stringBase64 = dataURL.replace(base64Regex, "");
        return Buffer.from(stringBase64, "base64");
      }

      // Load file ke PizZip
      const zip = new PizZip(content);

      // Setup image module
      const imageOpts = {
        getImage: function (tagValue) {
          // ImageModule akan memanggil ini untuk setiap item dalam loop
          // tagValue akan berupa string base64 data URL (bukan array)
          try {
            if (!tagValue) {
              console.error("[FOTO] getImage: tagValue is null/undefined");
              // Return empty buffer instead of null to avoid ImageModule error
              return Buffer.alloc(0);
            }

            if (Buffer.isBuffer(tagValue)) {
              return tagValue;
            }

            if (typeof tagValue !== "string") {
              console.error(
                "[FOTO] getImage: tagValue is not string, type:",
                typeof tagValue
              );
              return Buffer.alloc(0);
            }

            if (tagValue.startsWith("data:image/")) {
              try {
                const buffer = base64DataURLToArrayBuffer(tagValue);
                if (!buffer || buffer.length === 0) {
                  console.error("[FOTO] getImage: buffer is empty");
                  return Buffer.alloc(0);
                }
                return buffer;
              } catch (err) {
                console.error("[FOTO] getImage error:", err);
                return Buffer.alloc(0);
              }
            }

            console.error(
              "[FOTO] getImage: tagValue does not start with data:image/"
            );
            return Buffer.alloc(0);
          } catch (err) {
            console.error("[FOTO] getImage unexpected error:", err);
            return Buffer.alloc(0);
          }
        },
        getSize: function (img, tagValue, tagName) {
          // ImageModule akan memanggil ini untuk setiap item dalam loop
          // tagValue akan berupa string base64 data URL (bukan array)
          try {
            // Untuk foto, kembalikan ukuran asli (tidak diubah)
            if (tagName && (tagName.startsWith("foto") || tagName === "foto")) {
              let buffer = null;

              if (Buffer.isBuffer(tagValue)) {
                buffer = tagValue;
              } else if (
                tagValue &&
                typeof tagValue === "string" &&
                tagValue.startsWith("data:image/")
              ) {
                try {
                  buffer = base64DataURLToArrayBuffer(tagValue);
                } catch (err) {
                  console.error("[FOTO] getSize buffer error:", err);
                }
              }

              // Kembalikan ukuran asli foto
              if (buffer && buffer.length > 0 && sizeOf) {
                try {
                  const dim = sizeOf(buffer);
                  if (dim?.width && dim?.height) {
                    // Kembalikan ukuran asli tanpa perubahan
                    return [dim.width, dim.height];
                  }
                } catch (err) {
                  console.error("[FOTO] getSize sizeOf error:", err);
                }
              }

              // fallback jika tidak bisa membaca ukuran
              return [600, 800];
            }

            // default untuk gambar lain (mis. qrCode)
            return [100, 100];
          } catch (err) {
            console.error("[FOTO] getSize error:", err);
            return [600, 800]; // fallback
          }
        },
      };
      const imageModule = new ImageModule(imageOpts);

      // Inisialisasi Docxtemplater dengan imageModule
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule],
      });
      console.log("QR Code Length:", qrDataUrl.length);
      console.log("[FOTO] Sending to template:", fotoArray.length, "photos");

      // Siapkan data untuk template
      const templateData = {
        bendaharaNama: dataBendahara.pegawai_bendahara.nama,
        bendaharaNip: dataBendahara.pegawai_bendahara.nip,
        bendaharaJabatan: dataBendahara.jabatan,
        untukPembayaran: dataBendahara.sumberDana.untukPembayaran || "",
        kalimat1: dataBendahara.sumberDana.kalimat1 || "",
        kalimat2: dataBendahara.sumberDana.kalimat2 || "",
        KPAJabatan,
        indukUnitKerja,
        nomorSurat: totalDurasi > 7 ? nomorSPD : nomorST,
        surat: totalDurasi > 7 ? "SPD" : "ND",
        suratRill:
          totalDurasi > 7
            ? "Surat Perjalanan Dinas (SPD) "
            : "Surat Nota Dinas (ND)",
        untuk,
        tanggalBerangkat: "",
        tujuan: "",
        jumlah: "",
        totalRill,
        pegawaiNama,
        pegawaiNip,
        pegawaiJabatan,
        KPANama,
        KPANip,
        tanggalPengajuan: formatTanggal(tanggalPengajuan),
        PPTKNama,
        PPTKNip,
        qrCode: qrDataUrl,
        total,
        terbilang,
        BPD,
        subKegiatan,
        jenisPerjalanan,
        Rill,
        tahun,
        tempatSpd1: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempatSpd2:
          tempat.length === 1
            ? ""
            : tempat.length > 1 && jenis === 1
            ? tempat[1]?.tempat
            : tempat.length > 1 && jenis !== 1
            ? tempat[1]?.dalamKota.nama
            : "", // Nilai default jika tidak ada kondisi yang terpenuhi

        tempatSpd3:
          tempat.length === 1
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "", // Nilai default jika tidak ada kondisi yang terpenuhi
      };

      // CATATAN: docxtemplater-image-module-free memiliki bug dengan loop array,
      // jadi loop {#foto}{%foto}{/foto} tidak bekerja dengan baik
      //
      // SOLUSI: Kirim foto sebagai property terpisah (foto1, foto2, dll)
      // Template Word perlu menggunakan: {%foto1}, {%foto2}, {%foto3}, dst (tanpa loop)
      // Setiap placeholder harus di baris/paragraf terpisah di Word
      if (fotoArray.length > 0) {
        // Kirim setiap foto sebagai property terpisah (foto1, foto2, dll)
        fotoArray.forEach((foto, index) => {
          templateData[`foto${index + 1}`] = foto;
        });

        // Juga kirim foto pertama sebagai 'foto' untuk backward compatibility
        // (jika template hanya menggunakan {%foto} tanpa angka)
        templateData.foto = fotoArray[0];

        console.log(
          "[FOTO] Sending",
          fotoArray.length,
          "photos as foto1, foto2, foto3, etc. (and 'foto' for first photo)"
        );
      } else {
        console.log("[FOTO] No photos to send");
      }

      // Masukkan data ke dalam template
      doc.render(templateData);

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

  cetakKwitansiPDF: async (req, res) => {
    // console.log(req.body.rincianBPD, "DRI DEPAN");
    const {
      id,
      nomorSPD,
      nomorST,
      pegawaiNama,
      pegawaiNip,
      pegawaiJabatan,
      PPTKNama,
      KPANama,
      KPANip,
      PPTKNip,
      untuk,
      rincianBPD,
      kodeRekening,
      indukUnitKerja,
      tanggalPengajuan,
      totalDurasi,
      tempat,
      jenis,
      jenisPerjalanan,
      dataBendahara,
      subKegiatan,
      KPAJabatan,
      tahun,
      templateId,
    } = req.body;

    const formatTanggal = (tanggal) =>
      new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

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

      if (angka < 12) return satuan[angka];
      else if (angka < 20) return formatTerbilang(angka - 10) + " Belas";
      else if (angka < 100)
        return (
          formatTerbilang(Math.floor(angka / 10)) +
          " Puluh " +
          formatTerbilang(angka % 10)
        );
      else if (angka < 200) return "Seratus " + formatTerbilang(angka - 100);
      else if (angka < 1000)
        return (
          formatTerbilang(Math.floor(angka / 100)) +
          " Ratus " +
          formatTerbilang(angka % 100)
        );
      else if (angka < 2000) return "Seribu " + formatTerbilang(angka - 1000);
      else if (angka < 1000000)
        return (
          formatTerbilang(Math.floor(angka / 1000)) +
          " Ribu " +
          formatTerbilang(angka % 1000)
        );
      else if (angka < 1000000000)
        return (
          formatTerbilang(Math.floor(angka / 1000000)) +
          " Juta " +
          formatTerbilang(angka % 1000000)
        );
      else if (angka < 1000000000000)
        return (
          formatTerbilang(Math.floor(angka / 1000000000)) +
          " Milyar " +
          formatTerbilang(angka % 1000000000)
        );
    }

    const BPD = rincianBPD.map((item, index) => ({
      no: index + 1,
      jenis: item.jenisRincianBPD.jenis,
      satuan: item.satuan,
      item: item.item,
      qty: item.qty,
      harga: formatRupiah(item.nilai || 0),
      jumlah: formatRupiah(item.qty * item.nilai || 0),
    }));

    const Rill = rincianBPD
      .filter((item) => item.jenisId === 5)
      .flatMap((item) => item.rills)
      .map((item, index) => ({
        ...item,
        nilai: formatRupiah(item.nilai),
        no: index + 1,
      }));

    const totalRill = formatRupiah(
      Rill.reduce(
        (sum, item) =>
          sum +
          parseFloat(item.nilai.replace(/[^0-9,-]+/g, "").replace(",", ".")),
        0
      )
    );

    const total = formatRupiah(
      rincianBPD.reduce((sum, item) => sum + (item.qty * item.nilai || 0), 0)
    );

    const terbilang =
      formatTerbilang(
        rincianBPD.reduce((sum, item) => sum + (item.qty * item.nilai || 0), 0)
      ) + " Rupiah";

    try {
      const resultTemplate = await templateKeuangan.findOne({
        where: { id: templateId },
        attributes: ["id", "template"],
      });

      const templatePath = path.join(
        __dirname,
        "../public",
        resultTemplate.template
      );

      const content = fs.readFileSync(templatePath, "binary");
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      console.log(qrDataUrl, "INI QRCODEEE");
      doc.render({
        bendaharaNama: dataBendahara.pegawai_bendahara.nama,
        bendaharaNip: dataBendahara.pegawai_bendahara.nip,
        bendaharaJabatan: dataBendahara.jabatan,
        untukPembayaran: dataBendahara.sumberDana.untukPembayaran || "",
        kalimat1: dataBendahara.sumberDana.kalimat1 || "",
        kalimat2: dataBendahara.sumberDana.kalimat2 || "",
        KPAJabatan,
        indukUnitKerja,
        nomorSurat: totalDurasi > 7 ? nomorSPD : nomorST,
        surat: totalDurasi > 7 ? "SPD" : "ND",
        suratRill:
          totalDurasi > 7
            ? "Surat Perjalanan Dinas (SPD) "
            : "Surat Nota Dinas (ND)",
        untuk,
        tanggalBerangkat: "",
        tujuan: "",
        jumlah: "",
        totalRill,
        pegawaiNama,
        pegawaiNip,
        pegawaiJabatan,
        KPANama,
        KPANip,
        tanggalPengajuan: formatTanggal(tanggalPengajuan),
        PPTKNama,
        PPTKNip,
        kodeRekening,
        total,
        terbilang,
        BPD,
        subKegiatan,
        jenisPerjalanan,
        Rill,
        qrCode: qrDataUrl,
        tahun,
        tempatSpd1: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempatSpd2:
          tempat.length === 1
            ? ""
            : tempat.length > 1 && jenis === 1
            ? tempat[1]?.tempat
            : tempat.length > 1 && jenis !== 1
            ? tempat[1]?.dalamKota.nama
            : "",
        tempatSpd3:
          tempat.length === 1
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "",
      });

      // === Simpan dulu ke DOCX ===
      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const outputDocx = path.join(
        __dirname,
        "../public/output",
        `SPPD_${Date.now()}.docx`
      );
      fs.writeFileSync(outputDocx, buffer);

      // === Konversi DOCX -> PDF ===
      const outputPdf = outputDocx.replace(".docx", ".pdf");

      // Konversi DOCX ke PDF menggunakan LibreOffice
      const isWindows = process.platform === "win32";
      let convertCommand;

      if (isWindows) {
        // Coba beberapa kemungkinan path LibreOffice di Windows
        const possiblePaths = [
          '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"',
          '"C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"',
          "soffice",
        ];

        convertCommand = `${
          possiblePaths[0]
        } --headless --convert-to pdf "${outputDocx}" --outdir "${path.dirname(
          outputDocx
        )}"`;
      } else {
        // Untuk Linux/Mac
        convertCommand = `soffice --headless --convert-to pdf "${outputDocx}" --outdir "${path.dirname(
          outputDocx
        )}"`;
      }

      exec(convertCommand, (err) => {
        if (err) {
          console.error("Konversi PDF gagal:", err);
          // Fallback: kirim file DOCX jika konversi PDF gagal
          console.log("Mengirim file DOCX sebagai fallback...");
          res.download(outputDocx, "kwitansi.docx", (err) => {
            if (err) {
              console.error("Error mengirim file:", err);
              res.status(500).send("Error mengirim file");
            }
            // Hapus file sementara setelah dikirim
            fs.unlinkSync(outputDocx);
          });
          return;
        }

        // Konversi berhasil, kirim PDF
        res.download(outputPdf, "kwitansi.pdf", (err) => {
          if (err) {
            console.error("Error mengirim file:", err);
            res.status(500).send("Error mengirim file");
          }
          // Hapus file sementara setelah dikirim
          fs.unlinkSync(outputDocx);
          fs.unlinkSync(outputPdf);
        });
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },

  cetakKwitansiOtomatis: async (req, res) => {
    const transaction = await sequelize.transaction();
    const {
      id,
      totalDurasi,
      personilId,
      uangHarian,
      uangTransport,
      tempatNama,
      asal,
      pelayananKesehatan,
    } = req.body;
    console.log(req.body, "AAAAAA");
    const BEUangtransport =
      pelayananKesehatan.id === 1
        ? uangTransport
        : pelayananKesehatan.uangTransport;
    try {
      const rillBPD = await rincianBPD.create(
        {
          personilId,
          item: "Pengeluaran Rill",
          nilai: BEUangtransport,
          jenisId: 5,
          qty: 1,
          satuan: "-",
        },
        { transaction }
      );
      console.log(rillBPD.id);

      if (pelayananKesehatan.id === 1) {
        const rillTransport = await rill.create(
          {
            rincianBPDId: rillBPD.id,
            item: `transport ${asal} ke ${tempatNama} (PP)`,
            nilai: BEUangtransport,
          },
          { transaction }
        );
      } else {
        const rillTransport = await rill.create(
          {
            rincianBPDId: rillBPD.id,
            item: `transport pelayanan kesehatan (PP)`,
            nilai: BEUangtransport,
          },
          { transaction }
        );
      }

      if (totalDurasi > 7 && pelayananKesehatan.id === 1) {
        const uangHarianBPD = await rincianBPD.create(
          {
            personilId,
            item: "Uang harian",
            nilai: uangHarian,
            jenisId: 1,
            qty: 1,
            satuan: "OH",
          },
          { transaction }
        );
      }

      const updatePersonil = await personil.update(
        {
          total: uangHarian + BEUangtransport,
        },
        {
          where: { id: personilId },
          transaction,
        }
      );

      await transaction.commit();
      return res.status(200).json({ massage: "BPD berhasil ditambahkan" });
    } catch (err) {
      await transaction.rollback();
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  deleteBPD: async (req, res) => {
    try {
      const { id } = req.body;

      const result = await rincianBPD.destroy({
        where: { id },
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  updateBPD: async (req, res) => {
    try {
      const { id, item, nilai, qty, satuan } = req.body;
      console.log(req.body);
      const result = await rincianBPD.update(
        { item, nilai, qty, satuan },
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
  terimaVerifikasi: async (req, res) => {
    const personilId = req.body.personilId;
    try {
      // Cek statusId sebelum update untuk mengetahui apakah berubah dari 2
      const personilData = await personil.findOne({
        where: { id: personilId },
      });
      const wasStatusId2 = personilData?.statusId === 2;

      const result = await personil.update(
        {
          statusId: 3,
        },
        { where: { id: personilId } }
      );

      // Emit notifikasi jika statusId berubah dari 2
      if (wasStatusId2) {
        try {
          const io = req.app.get("socketio");
          await emitNotifikasiPersonil(io);
        } catch (notifErr) {
          console.error(
            "⚠️ Error emit notifikasi (tidak menghentikan response):",
            notifErr
          );
        }
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  tolakVerifikasi: async (req, res) => {
    const personilId = req.body.personilId;
    const catatan = req.body.catatan;

    try {
      // Cek statusId sebelum update untuk mengetahui apakah berubah dari 2
      const personilData = await personil.findOne({
        where: { id: personilId },
      });
      const wasStatusId2 = personilData?.statusId === 2;

      const result = await personil.update(
        {
          statusId: 4,
          catatan,
        },
        { where: { id: personilId } }
      );

      // Emit notifikasi karena statusId berubah menjadi 4 (kwitansi ditolak)
      // Perubahan ini mempengaruhi count statusId=2 (berkurang) dan statusId=4 (bertambah)
      try {
        const io = req.app.get("socketio");
        await emitNotifikasiPersonil(io);
      } catch (notifErr) {
        console.error(
          "⚠️ Error emit notifikasi (tidak menghentikan response):",
          notifErr
        );
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  pengajuan: async (req, res) => {
    const id = parseInt(req.params.id);
    const dataBendahara = req.body.dataBendahara;
    const perjalananId = req.body.perjalananId;
    console.log(id, "INI ID UNUTK PENGAJUAN KUITANSI");
    console.log(dataBendahara);
    const transaction = await sequelize.transaction();
    try {
      const result = await personil.update(
        {
          statusId: 2,
        },
        { where: { id } },
        transaction
      );

      await transaction.commit();

      // Emit notifikasi realtime setelah update berhasil
      try {
        const io = req.app.get("socketio");
        await emitNotifikasiPersonil(io);
      } catch (notifErr) {
        console.error(
          "⚠️ Error emit notifikasi (tidak menghentikan response):",
          notifErr
        );
      }

      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  addKwitansiGlobal: async (req, res) => {
    const { personils } = req.body;
    try {
      const result = await Promise.all(
        personils.map((p) =>
          personil.update(
            { ...p }, // data yang diupdate
            { where: { id: p.id } } // pastikan ada id di tiap object
          )
        )
      );

      // Cek apakah ada perubahan statusId menjadi 2 (pengajuan) atau 4 (ditolak)
      const hasStatusIdChange = personils.some(
        (p) => p.statusId === 2 || p.statusId === 4 || p.statusId !== undefined
      );

      // Emit notifikasi jika ada perubahan yang mungkin mempengaruhi count
      // Hook di model juga akan menangani ini, tapi ini untuk memastikan
      if (hasStatusIdChange) {
        try {
          const io = req.app.get("socketio");
          await emitNotifikasiPersonil(io);
        } catch (notifErr) {
          console.error(
            "⚠️ Error emit notifikasi (tidak menghentikan response):",
            notifErr
          );
        }
      }

      return res.status(200).json({ message: "Update berhasil", result });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
