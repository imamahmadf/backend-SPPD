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
  postBuktiKegiatan: async (req, res) => {
    const id = parseInt(req.body.id);
    console.log(req.body);
    console.log(id, "ECEKKKKKKK");
    try {
      const filePath = "bukti";
      let pic = null;
      if (req.file) {
        const { filename } = req.file;
        pic = `/${filePath}/${filename}`;
      }
      const result = await perjalanan.update(
        {
          pic,
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
          formatTerbilang(angka % 1000000000)
        );
      } else if (angka < 1000000000000) {
        return (
          formatTerbilang(Math.floor(angka / 1000000000)) +
          " Milyar " +
          formatTerbilang(angka % 1000000000000)
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
        untukPembayaran: dataBendahara.sumberDana.untukPembayaran || "",
        kalimat1: dataBendahara.sumberDana.kalimat1 || "",
        kalimat2: dataBendahara.sumberDana.kalimat2 || "",
        KPAJabatan,
        indukUnitKerja,
        nomorSurat: totalDurasi > 7 ? nomorSPD : nomorST,
        surat: totalDurasi > 7 ? "SPPD" : "ND",
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

      // Buat path untuk menyimpan file DOCX sementara
      const tempDocxFileName = `SPPD_${Date.now()}.docx`;
      const tempDocxPath = path.join(
        __dirname,
        "../public/output",
        tempDocxFileName
      );

      // Simpan file DOCX sementara
      fs.writeFileSync(tempDocxPath, buffer);

      // Buat path untuk file PDF
      const outputFileName = `SPPD_${Date.now()}.pdf`;
      const outputPath = path.join(
        __dirname,
        "../public/output",
        outputFileName
      );

      // Konversi DOCX ke PDF menggunakan HTML template dan puppeteer
      try {
        // Buat template HTML sederhana untuk PDF
        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>SPPD Kwitansi</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .content { margin-bottom: 20px; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
              .footer { margin-top: 40px; }
              .signature { margin-top: 60px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>KWITANSI</h2>
              <p>Nomor: ${totalDurasi > 7 ? nomorSPD : nomorST}</p>
            </div>
            
            <div class="content">
              <p>Yang bertanda tangan di bawah ini:</p>
              <p>Nama: ${dataBendahara.pegawai_bendahara.nama}</p>
              <p>NIP: ${dataBendahara.pegawai_bendahara.nip}</p>
              <p>Jabatan: ${dataBendahara.jabatan}</p>
              <p>Unit Kerja: ${indukUnitKerja}</p>
              
              <p>Menerima uang sebesar: <strong>${total}</strong></p>
              <p>Terbilang: <strong>${terbilang}</strong></p>
              
              <p>Untuk pembayaran: ${untuk}</p>
              <p>Kode Rekening: ${kodeRekening}</p>
              <p>Sub Kegiatan: ${subKegiatan}</p>
              
              <h3>Rincian Pengeluaran:</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Jenis</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Satuan</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  ${BPD.map(
                    (item) => `
                    <tr>
                      <td>${item.no}</td>
                      <td>${item.jenis}</td>
                      <td>${item.item}</td>
                      <td>${item.qty}</td>
                      <td>${item.satuan}</td>
                      <td>${item.harga}</td>
                      <td>${item.jumlah}</td>
                    </tr>
                  `
                  ).join("")}
                </tbody>
              </table>
              
              ${
                Rill.length > 0
                  ? `
                <h3>Pengeluaran Rill:</h3>
                <table class="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Item</th>
                      <th>Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Rill.map(
                      (item) => `
                      <tr>
                        <td>${item.no}</td>
                        <td>${item.item}</td>
                        <td>${item.nilai}</td>
                      </tr>
                    `
                    ).join("")}
                  </tbody>
                </table>
                <p>Total Rill: <strong>${totalRill}</strong></p>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>Tanggal: ${formatTanggal(tanggalPengajuan)}</p>
              <p>Tahun: ${tahun}</p>
            </div>
            
            <div class="signature">
              <p>Yang menerima,</p>
              <br><br><br>
              <p>${dataBendahara.pegawai_bendahara.nama}</p>
              <p>NIP. ${dataBendahara.pegawai_bendahara.nip}</p>
            </div>
          </body>
          </html>
        `;

        // Simpan HTML template sementara
        const tempHtmlPath = path.join(
          __dirname,
          "../public/output",
          `temp_${Date.now()}.html`
        );
        fs.writeFileSync(tempHtmlPath, htmlTemplate);

        // Gunakan puppeteer untuk konversi HTML ke PDF
        // Install: npm install puppeteer-core
        const puppeteer = require("puppeteer-core");
        // Tentukan path Chrome (hindari download Chromium bawaan puppeteer)
        const resolveChromeExecutablePath = () => {
          if (
            process.env.CHROME_PATH &&
            fs.existsSync(process.env.CHROME_PATH)
          ) {
            return process.env.CHROME_PATH;
          }
          const possiblePaths = [
            // Chrome Stable
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
            "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
            // Microsoft Edge (Chromium) sebagai fallback
            "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
            "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
          ];
          for (const candidate of possiblePaths) {
            try {
              if (fs.existsSync(candidate)) return candidate;
            } catch (_) {}
          }
          return null;
        };
        const chromePath = resolveChromeExecutablePath();
        if (!chromePath) {
          throw new Error(
            "Chrome/Edge tidak ditemukan. Set CHROME_PATH env ke lokasi chrome.exe"
          );
        }

        (async () => {
          try {
            const browser = await puppeteer.launch({
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
              executablePath: chromePath,
            });
            const page = await browser.newPage();

            // Load HTML content
            await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });

            // Generate PDF
            await page.pdf({
              path: outputPath,
              format: "A4",
              margin: {
                top: "20mm",
                right: "20mm",
                bottom: "20mm",
                left: "20mm",
              },
            });

            await browser.close();

            // Hapus file sementara
            fs.unlinkSync(tempDocxPath);
            fs.unlinkSync(tempHtmlPath);

            // Kirim file PDF ke frontend
            res.download(outputPath, outputFileName, (err) => {
              if (err) {
                console.error("Error sending PDF file:", err);
                res.status(500).send("Error generating PDF file");
              }
              // Hapus file setelah dikirim
              fs.unlinkSync(outputPath);
            });
          } catch (puppeteerError) {
            console.error("Error in puppeteer conversion:", puppeteerError);
            // Hapus file sementara
            fs.unlinkSync(tempDocxPath);
            fs.unlinkSync(tempHtmlPath);
            return res.status(500).json({
              message: "Error in PDF conversion process",
              code: 500,
            });
          }
        })();
      } catch (conversionError) {
        console.error("Error in PDF conversion:", conversionError);
        // Hapus file DOCX sementara
        fs.unlinkSync(tempDocxPath);
        return res.status(500).json({
          message: "Error in PDF conversion process",
          code: 500,
        });
      }
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
