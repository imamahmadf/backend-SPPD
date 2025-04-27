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
  dalamKota,
  jenisPerjalanan,
  KPA,
  bendahara,
  status,
  sequelize,
  sumberDana,
} = require("../models");

const { Op, where } = require("sequelize");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");

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
            attributes: ["id", "asal", "tanggalPengajuan", "untuk"],
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
                model: jenisPerjalanan,
              },
              {
                model: bendahara,
                attributes: ["id", "jabatan"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip"],
                    as: "pegawai_bendahara",
                  },
                  {
                    model: sumberDana,
                    attributes: ["id", "sumber", "untukPembayaran"],
                  },
                ],
              },
              {
                model: daftarSubKegiatan,
                attributes: ["id", "kodeRekening", "subKegiatan"],
                include: [
                  {
                    model: daftarKegiatan,
                    attributes: ["id", "kodeRekening", "kegiatan"],
                    as: "kegiatan",
                  },
                ],
              },
              {
                model: ttdSuratTugas,
                attributes: ["id", "jabatan"],
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
      });

      const jenisRampung = await jenisRincianBPD.findAll();

      return res.status(200).json({ result, jenisRampung, daftarRill });
    } catch (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  cetakKwitansi: async (req, res) => {
    console.log(req.body, "DRI DEPAN");
    const {
      id,
      nomorSPD,
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
      tanggalPengajuan,
      totalDurasi,
      tempat,
      jenis,
      jenisPerjalanan,
      dataBendahara,
      subKegiatan,
      KPAJabatan,
      tahun,
    } = req.body;
    console.log(
      dataBendahara.pegawai_bendahara,
      "INI DATA DARI DEPAN UNUTK PEGAWAI BENDAHARA"
    );
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
      .filter((item) => item.jenisId === 4) // Filter berdasarkan jenisId
      .flatMap((item) => item.rills) // Langsung flatten tanpa map().flat()
      .map((item, index) => ({
        ...item,
        nilai: formatRupiah(item.nilai),
        no: index + 1,
      })); // Tambahkan nomor urut

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
        bendaharaNama: dataBendahara.pegawai_bendahara.nama,
        bendaharaNip: dataBendahara.pegawai_bendahara.nip,
        bendaharaJabatan: dataBendahara.jabatan,
        untukPembayaran: dataBendahara.sumberDana.untukPembayaran,
        KPAJabatan,
        nomorSurat: nomorSPD,
        surat: totalDurasi > 7 ? "SPD" : "ND",
        berdasarkan:
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
    } = req.body;
    console.log(req.body, "AAAAAA");

    try {
      const rillBPD = await rincianBPD.create(
        {
          personilId,
          item: "Pengeluaran Rill",
          nilai: uangTransport,
          jenisId: 4,
          qty: 1,
          satuan: "-",
        },
        { transaction }
      );
      console.log(rillBPD.id);
      const rillTransport = await rill.create(
        {
          rincianBPDId: rillBPD.id,
          item: `transport ${asal} ke ${tempatNama} (PP)`,
          nilai: uangTransport,
        },
        { transaction }
      );

      if (totalDurasi > 7) {
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
          total: uangHarian + uangTransport,
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
      const result = await personil.update(
        {
          statusId: 3,
        },
        { where: { id: personilId } }
      );
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
      const result = await personil.update(
        {
          statusId: 4,
          catatan,
        },
        { where: { id: personilId } }
      );
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
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
};
// status == 0 blm disetujui perjadinnya
// status == 1 blm dibuat kwitansinya
// status == 2 sdh dibuat tapi blm diverifikasi (menunggu verifikasi)
// status == 3 sdh diferifikasi dan bisa di cetak
// status == 4 ada kesalahan SPJ harus diperbaiki
