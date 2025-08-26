const { Op, where } = require("sequelize");
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
  dalamKota,
  daftarTingkatan,
  KPA,
  ttdNotaDinas,
  daftarUnitKerja,
  indukUnitKerja,
  klasifikasi,
  suratKeluar,
  status,
  sumberDana,
  kadis,
  bendahara,
  tipePerjalanan,
  profesi,
  pelayananKesehatan,
  jenisRincianBPD,
  rill,
  rincianBPD,
  sumberDanaJenisPerjalanan,
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
        dataTtdNotaDinas,
        ttdNotDis,
        asal,
        perjalananKota,
        subKegiatanId,
        jenis,
        dalamKota,
        indukUnitKerjaFE,
        PPTKId,
        KPAId,
        dasar,
        kodeKlasifikasi,
        isSrikandi,
        isNotaDinas,
        dataBendaharaId,
        subKegiatan,
      } = req.body;
      const pelayananKesehatanId = req.body.pelayananKesehatanId || 1;
      console.log(req.body.pegawai, "KODE KLASIFIKASI");
      const calculateDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const difference = Math.abs(end - start);
        return Math.round(difference / millisecondsPerDay) + 1; // Adding 1 to include both start and end dates
      };
      function terbilang(angka) {
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
          return terbilang(angka - 10) + " Belas";
        } else if (angka < 100) {
          return (
            terbilang(Math.floor(angka / 10)) +
            " Puluh " +
            terbilang(angka % 10)
          );
        } else if (angka < 200) {
          return "Seratus " + terbilang(angka - 100);
        }
      }
      const getRomanMonth = (date) => {
        const months = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ];
        return months[date.getMonth()];
      };
      console.log(dalamKota, perjalananKota);

      // Ambil satu data nomor surat berdasarkan id = 2
      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],

        transaction, // Letakkan dalam objek konfigurasi yang sama
      });

      // Pastikan dbNoSurat ditemukan sebelum digunakan
      if (!dbNoSurat) {
        throw new Error("Data nomor surat tidak ditemukan.");
      }

      // Update nomor loket
      const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;

      const kode =
        indukUnitKerjaFE.indukUnitKerja.kodeInduk === indukUnitKerjaFE.kode
          ? indukUnitKerjaFE.kode
          : indukUnitKerjaFE.indukUnitKerja.kodeInduk +
            "/" +
            indukUnitKerjaFE.kode;

      // Buat nomor baru dengan mengganti "NOMOR" dengan nomorLoket
      const nomorBaru = dbNoSurat.jenisSurat.nomorSurat
        .replace(
          "NOMOR",
          indukUnitKerjaFE.indukUnitKerja.id == 1
            ? "     "
            : nomorLoket.toString()
        )
        .replace("KLASIFIKASI", kodeKlasifikasi.value.kode)
        .replace("KODE", kode)
        .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan)));

      const resultSuratKeluar = await suratKeluar.create(
        {
          nomor: nomorBaru,
          Perihal: jenis.jenis,
          tanggalSurat: tanggalPengajuan,
          tujuan: dataTtdSurTug.value.jabatan,
          indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id,
        },
        transaction
      );

      // Update nomor loket ke database
      await daftarNomorSurat.update(
        { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSurat.id }, transaction }
      );

      // Ubah format tanggalPengajuan
      const formattedTanggalPengajuan = new Date(
        tanggalPengajuan
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // console.log(resultSuratKeluar.id, "CEKDISINI");
      // Simpan data perjalanan
      const dbPerjalanan = await perjalanan.create(
        {
          untuk,
          noNotaDinas: nomorBaru,
          nomorSuratKeluarId: resultSuratKeluar.id,
          asal,
          tanggalPengajuan,
          bendaharaId: dataBendaharaId,
          subKegiatanId,
          ttdNotaDinasId: dataTtdNotaDinas.value.id,
          ttdSuratTugasId: dataTtdSurTug.value.id,
          jenisId: jenis.id,
          KPAId,
          dasar,
          PPTKId,
          pelayananKesehatanId,
          tipeSrikandi: isSrikandi,
          isNotaDinas,
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
        status: 1,
      }));

      await personil.bulkCreate(dataPersonil, { transaction });
      let dataKota = []; // Inisialisasi dataKota sebagai array kosong
      let dataDalamKota = [];
      if (jenis.tipePerjalananId === 2) {
        // Buat data kota tujuan
        dataKota = perjalananKota.map((item) => ({
          perjalananId: dbPerjalanan.id,
          tempat: item.kota,
          tanggalBerangkat: item.tanggalBerangkat,
          tanggalPulang: item.tanggalPulang,
          dalamKotaId: 1,
        }));

        await tempat.bulkCreate(dataKota, { transaction });
      } else if (jenis.tipePerjalananId === 1) {
        dataDalamKota = dalamKota.map((item) =>
          // console.log(item),
          ({
            perjalananId: dbPerjalanan.id,
            tempat: "dalam kota",
            dalamKotaId: item.dataDalamKota.id,
            tanggalBerangkat: item.tanggalBerangkat,
            tanggalPulang: item.tanggalPulang,
          })
        );
        await tempat.bulkCreate(dataDalamKota, { transaction });
      }
      // console.log(dataDalamKota);
      // Path file template

      const template = await indukUnitKerja.findOne({
        where: { id: indukUnitKerjaFE.indukUnitKerja.id },
        attributes: ["id", "templateNotaDinas", "telaahan"],
        transaction, // ✅ Letakkan di dalam objek config
      });
      if (!dalamKota.length && !dataKota.length) {
        throw new Error("Data tanggal berangkat dan pulang tidak tersedia.");
      }

      const tanggalBerangkatFE = dalamKota[0].tanggalBerangkat
        ? dalamKota[0].tanggalBerangkat
        : dataKota[0].tanggalBerangkat;
      const tanggalPulangFE = dalamKota[dalamKota.length - 1].tanggalPulang
        ? dalamKota[dalamKota.length - 1].tanggalPulang
        : dataKota[dataKota.length - 1].tanggalPulang;

      const daysDifference = calculateDaysDifference(
        tanggalBerangkatFE,
        tanggalPulangFE
      );
      const formattedTanggalBerangkat = new Date(
        tanggalBerangkatFE
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const formattedTanggalPulang = new Date(
        tanggalPulangFE
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const templatePath = path.join(
        __dirname,
        "../public",
        isNotaDinas ? template.templateNotaDinas : template.telaahan
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
      console.log(dataKota, dalamKota, jenis);
      doc.render({
        dataPegawai,
        tanggalPengajuan: formattedTanggalPengajuan,
        untuk,
        ttd: isSrikandi ? "${ttd_pengirim}" : "",
        tempat1:
          jenis.id === 1
            ? dataKota[0]?.tempat
            : dalamKota[0].dataDalamKota.nama,
        tempat2:
          jenis.id === 2
            ? dalamKota.length === 1
              ? ""
              : dalamKota[1]?.dataDalamKota.nama
            : dataKota.length === 1
            ? ""
            : dataKota[1]?.tempat,
        tempat3:
          jenis.id === 2
            ? dalamKota.length === 1
              ? ""
              : dalamKota[2]?.dataDalamKota.nama
            : dataKota.length === 1
            ? ""
            : dataKota[2]?.tempat,

        kode: kodeRekeningFE,
        subKegiatan,
        noNotDis: nomorBaru,
        ttdSurtTugJabatan: dataTtdSurTug.value.jabatan,
        ttdNotDinNama: ttdNotDis.value.pegawai_notaDinas.nama,
        ttdNotDinPangkat:
          ttdNotDis.value.pegawai_notaDinas.daftarPangkat.pangkat,
        ttdNotDinGolongan:
          ttdNotDis.value.pegawai_notaDinas.daftarGolongan.golongan,
        ttdNotDinJabatan: ttdNotDis.value.jabatan,
        ttdNotDinNip: `NIP. ${ttdNotDis.value.pegawai_notaDinas.nip}`,
        sumber,
        jenis: jenis.jenis,
        tanggalBerangkat: formattedTanggalBerangkat,
        tanggalPulang: formattedTanggalPulang,
        jumlahHari: `${daysDifference} (${terbilang(daysDifference)}) hari`,
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
      await transaction.commit();
      // Simpan file hasil ke server
      fs.writeFileSync(outputPath, buffer);

      // Kirim file sebagai respons
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${outputFileName}`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      res.send(buffer);
      // Hapus file setelah dikirim
      fs.unlinkSync(outputPath);
    } catch (error) {
      await transaction.rollback();
      console.error("Error generating SPPD:", error);
      res.status(500).send("Terjadi kesalahan dalam pembuatan dokumen");
    }
  },
  getSeedPerjalanan: async (req, res) => {
    const { indukUnitKerjaId, unitKerjaId } = req.query;
    console.log(indukUnitKerjaId, unitKerjaId, "INI ID UNIT KERJA");

    try {
      const resultSumberDana = await sumberDana.findAll({
        attributes: ["id", "sumber"],
        include: [
          {
            model: bendahara,
            required: true,
            attributes: ["id", "jabatan"],
            where: { indukUnitKerjaId },
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama"],
                as: "pegawai_bendahara",
              },
            ],
          },
        ],
      });
      const resultDaftarSubKegiatan = await daftarSubKegiatan.findAll({
        attributes: ["id", "subKegiatan", "kodeRekening"],
        where: {
          unitKerjaId,
        },
      });
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({
        include: [{ model: tipePerjalanan }],
      });
      const resultTtdSuratTugas = await ttdSuratTugas.findAll({
        where: {
          [Op.or]: [{ indukUnitKerjaId }, { indukUnitKerjaId: 1 }],
        },
        order: [["indukUnitKerjaId", "DESC"]],
        attributes: ["id", "jabatan", "indukUnitKerjaId"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai",
          },
          {
            model: indukUnitKerja,
            attributes: ["id", "kodeInduk", "indukUnitKerja"],
            as: "indukUnitKerja_ttdSuratTugas",
          },
        ],
      });

      console.log("Data yang diambil:", resultTtdSuratTugas);

      const resultPelayananKesehatan = await pelayananKesehatan.findAll({});

      const resultTtdNotaDinas = await ttdNotaDinas.findAll({
        where: { unitKerjaId },
        attributes: ["id", "jabatan"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_notaDinas",
            include: [
              {
                model: daftarTingkatan,
                as: "daftarTingkatan",
              },
              { model: daftarGolongan, as: "daftarGolongan" },
              { model: daftarPangkat, as: "daftarPangkat" },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id"],
              },
            ],
          },
        ],
      });

      const resultPPTK = await PPTK.findAll({
        where: { unitKerjaId },
        attributes: ["id", "jabatan"],
        include: [
          {
            model: pegawai,
            attributes: ["id", "nama", "nip", "jabatan"],
            as: "pegawai_PPTK",
          },
        ],
      });
      const resultDaftarNomorSurat = await daftarNomorSurat.findAll({
        include: [{ model: jenisSurat, as: "jenisSurat" }],
        where: { indukUnitKerjaId },
      });
      const resultJenisTempat = await jenisTempat.findAll({
        attributes: ["id", "jenis", "koderekening"],
      });
      const resultDalamKota = await dalamKota.findAll({
        attributes: ["id", "nama", "durasi"],
        where: {
          indukUnitKerjaId,
        },
      });
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
      const resultKlasifikasi = await klasifikasi.findAll({
        attributes: ["id", "namaKlasifikasi", "kode"],
      });

      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "kode"],
      });
      return res.status(200).json({
        resultDaftarSubKegiatan,
        resultTtdSuratTugas,
        resultDaftarNomorSurat,
        resultJenisTempat,
        resultJenisPerjalanan,
        resultDalamKota,
        resultTtdNotaDinas,
        resultPPTK,
        resultKPA,
        resultKlasifikasi,
        resultSumberDana,
        resultPelayananKesehatan,
        resultUnitKerja,
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
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    // const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const time = "ASC";
    const offset = limit * page;
    console.log(unitKerjaId, "INI UNIT KERJA");
    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }
    try {
      const { count, rows } = await perjalanan.findAndCountAll({
        offset,
        limit,
        order: [
          ["id", "DESC"],
          [{ model: personil }, "id", "ASC"],
        ],
        attributes: [
          "id",
          "untuk",
          "asal",
          "dasar",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
          "isNotaDinas",
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
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                  { model: profesi, as: "profesi" },
                ],
              },
              { model: status },
            ],
          },
          {
            model: tempat,
            where: whereConditionTempat,
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
            model: suratKeluar,
            attributes: ["id", "nomor"],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: ttdSuratTugas,
            attributes: ["id", "jabatan", "indukUnitKerjaId"],
            paranoid: false, // ✅ tambahkan ini
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: indukUnitKerja,
                attributes: ["id", "kodeInduk"],
                as: "indukUnitKerja_ttdSuratTugas",
                // include: [
                //   {
                //     model: daftarUnitKerja,
                //     attributes: ["id", "kode"],
                //   },
                // ],
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id", "jabatan"],
            paranoid: false,
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
            ],
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId", "jabatan"],
            where: { unitKerjaId }, // ✅ Filter data berdasarkan unit kerja yang diminta
            required: true, // ✅ Pastikan hanya ambil yang punya relasi
            paranoid: false, // ✅ tambahkan ini
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: daftarUnitKerja,
                attributes: ["id", "indukUnitKerjaId"],
                as: "unitKerja_notaDinas",
                include: [
                  {
                    model: indukUnitKerja,
                    attributes: ["id", "kodeInduk"],
                  },
                ],
              },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
        ],
      });

      const filteredResult = rows.filter((item) => {
        const hasProfesiId1 = item.personils.some(
          (p) => p.pegawai?.profesi?.id === 1
        );

        // Kembalikan true jika TIDAK memiliki profesi.id == 1
        return !hasProfesiId1;
      });

      return res.status(200).json({
        result: filteredResult,
        page,
        limit,
        totalRows: count,
        totalPage: Math.ceil(count / limit),
      });
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
        ttdSurTugPangkat,
        ttdSurTugGolongan,
        ttdSurTugUnitKerja,
        KPANama,
        KPANip,
        KPAPangkat,
        KPAGolongan,
        KPAJabatan,
        noNotaDinas,
        noSuratTugas,
        jenis,
        unitKerja,
        dasar,
        indukUnitKerjaFE,
        ttdSurtTugKode,
      } = req.body;
      console.log(indukUnitKerjaFE.indukUnitKerja.id, "TTD SURAT TUGASSS");
      const totalDurasi = tempat.reduce(
        (total, temp) => total + temp.dalamKota.durasi,
        0
      );

      const getRomanMonth = (date) => {
        const months = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ];
        return months[date.getMonth()];
      };
      function terbilang(angka) {
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
          return terbilang(angka - 10) + " Belas";
        } else if (angka < 100) {
          return (
            terbilang(Math.floor(angka / 10)) +
            " Puluh " +
            terbilang(angka % 10)
          );
        } else if (angka < 200) {
          return "Seratus " + terbilang(angka - 100);
        }
      }
      // ////////////////////TERBILANG///////////////////////
      const calculateDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const difference = Math.abs(end - start);
        return Math.round(difference / millisecondsPerDay) + 1; // Adding 1 to include both start and end dates
      };

      const daysDifference = calculateDaysDifference(
        tempat[0].tanggalBerangkat,
        tempat[tempat.length - 1].tanggalPulang
      );

      const formatTanggal = (tanggal) => {
        return new Date(tanggal).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };
      const formattedTanggalBerangkat = new Date(
        tempat[0].tanggalBerangkat
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const formattedTanggalPulang = new Date(
        tempat[tempat.length - 1].tanggalPulang
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const formattedTanggalPengajuan = new Date(
        tanggalPengajuan
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      // Path file template
      // Ambil satu data nomor surat berdasarkan id = 1
      var nomorBaru = noSuratTugas;
      let noSpd;

      if (!noSuratTugas) {
        // MENGABIL NOMOR SURAT TUGAS /////////////
        const dbNoSurTug = await daftarNomorSurat.findOne({
          where: { indukUnitKerjaId: ttdSurTugUnitKerja },
          include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 1 } }],

          transaction,
        });

        // Pastikan dbNoSurat ditemukan sebelum digunakan
        if (!dbNoSurTug) {
          throw new Error("Data nomor surat tidak ditemukan.");
        }

        const nomorLoket = parseInt(dbNoSurTug.nomorLoket) + 1;
        const codeNoST =
          ttdSurtTugKode === indukUnitKerjaFE.kode
            ? ttdSurtTugKode
            : ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;
        nomorBaru = dbNoSurTug.jenisSurat.nomorSurat
          .replace(
            "NOMOR",
            indukUnitKerjaFE.indukUnitKerja.id == 1
              ? "         "
              : nomorLoket.toString()
          )
          .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan)))
          .replace("KODE", codeNoST);
        console.log(dbNoSurTug.id, "NOMOR SURAT");
        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: dbNoSurTug.id }, transaction }
        );

        // Update data perjalanan
        await perjalanan.update(
          { noSuratTugas: nomorBaru },
          { where: { id }, transaction }
        );
        //MENGAMBIL NOMOR SPD ///////////

        if (totalDurasi > 7) {
          const dbNoSPD = await daftarNomorSurat.findOne({
            where: { indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id },
            include: [
              { model: jenisSurat, as: "jenisSurat", where: { id: 3 } },
            ],
          });
          let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);

          console.log(dbNoSPD.jenisSurat.nomorSurat, "TES");

          const codeNoSPD =
            ttdSurtTugKode === indukUnitKerjaFE.kode
              ? ttdSurtTugKode
              : ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;

          noSpd = personilFE.map((item, index) => ({
            nomorSPD: dbNoSPD.jenisSurat.nomorSurat
              .replace(
                "NOMOR",
                (indukUnitKerjaFE.indukUnitKerja.id == 1
                  ? "         "
                  : nomorAwalSPD + index + 1
                ).toString()
              )
              .replace("KODE", codeNoSPD)
              .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan))),
          }));
          await daftarNomorSurat.update(
            { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
            { where: { id: dbNoSPD.id }, transaction }
          );
          for (const [index, item] of personilFE.entries()) {
            await personil.update(
              {
                nomorSPD: noSpd[index].nomorSPD,
                statusId: 1,
              },
              {
                where: { id: item.id }, // Pastikan ada kriteria unik
              }
            );
          }
        } else {
          for (const [index, item] of personilFE.entries()) {
            await personil.update(
              {
                nomorSPD: null,
                statusId: 1,
              },
              {
                where: { id: item.id }, // Pastikan ada kriteria unik
              }
            );
          }
        }

        // Update nomor loket ke database

        /////////////////////////////////////////////////////
        // const codeSurTug
        // let codeSurTug = "";
        // if (ttdSurTugUnitKerja == indukUnitKerjaFE.id) {
        //   if (ttdSurtTugKode === indukUnitKerjaFE.kode) {
        //     codeSurTug = ttdSurtTugKode;
        //     console.log("tes1");
        //   } else {
        //     ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;
        //     console.log("tes2");
        //   }
        // } else {
        //   codeSurTug = ttdSurtTugKode;
        //   console.log("tes3");
        // }
        const codeSurTug =
          ttdSurtTugKode === indukUnitKerjaFE.kode
            ? ttdSurtTugKode
            : ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;

        /////////////////////////////////////////
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
        pangkat: item.pegawai.daftarPangkat.pangkat,
        no: index + 1,
        kepada: "",
        a: "",
      }));

      dataPegawai[0].kepada = "kepada";
      dataPegawai[0].a = ":";

      const template = await indukUnitKerja.findOne(
        {
          where: { id: indukUnitKerjaFE.indukUnitKerja.id },
          attributes: ["id", "templateSuratTugas", "templateSuratTugasSingkat"],
        },
        { transaction }
      );

      const templatePath = path.join(
        __dirname,
        "../public",
        tempat.reduce((total, temp) => total + temp.dalamKota.durasi, 0) > 7
          ? template.templateSuratTugas
          : template.templateSuratTugasSingkat
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
        // tempat1: jenis.id === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        // tempat2: tempat[1]?.tempat || "",
        jumlahHari: `${daysDifference} (${terbilang(daysDifference)}) hari`,
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

        tempat1: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempat2: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempat3: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,

        tempat4:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "Tana Paser",

        tempat5:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "",

        tempat6:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "",

        tempat7:
          tempat.length === 1
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : tempat.length === 2 && jenis === 1
            ? "Tana Paser"
            : tempat.length === 2 && jenis !== 1
            ? ""
            : "Tana Paser",

        tempat8:
          tempat.length === 1 || tempat.length === 2
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "", // Default value if none of the conditions match

        tempat9:
          tempat.length === 1 || tempat.length === 2
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "", // Default value if none of the conditions match

        tempat10: tempat.length === 3 ? "Tana Paser" : "",

        tanggal1: formatTanggal(tempat[0]?.tanggalBerangkat),
        tanggal2: formatTanggal(tempat[0]?.tanggalBerangkat),
        tanggal3:
          tempat.length === 1
            ? formatTanggal(tempat[0]?.tanggalPulang)
            : formatTanggal(tempat[1]?.tanggalBerangkat),
        tanggal4:
          tempat.length === 1 ? "" : formatTanggal(tempat[1]?.tanggalBerangkat),

        tanggal5:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? formatTanggal(tempat[1]?.tanggalPulang)
            : formatTanggal(tempat[2]?.tanggalBerangkat),

        tanggal6:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? ""
            : formatTanggal(tempat[2]?.tanggalBerangkat),

        tanggal7:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? ""
            : formatTanggal(tempat[2]?.tanggalPulang),

        tanggalBerangkat: formattedTanggalBerangkat,
        tanggalPulang: formattedTanggalPulang,
        tanggalBerangkat1: tempat[0]?.tanggalBerangkat,
        tanggalPulang1: tempat[0]?.tanggalPulang,
        asal,
        kode,
        dasar: dasar ? dasar : noNotaDinas,
        noSuratTugas: nomorBaru,
        ttdSurTug,
        id,
        tanggalPengajuan: formattedTanggalPengajuan,
        tempat,
        untuk,
        ttdSurTugJabatan,
        ttdSurTugNama,
        ttdSurTugNip,
        ttdSurTugPangkat,
        ttdSurTugGolongan,
        KPANama,
        KPANip,
        KPAPangkat,
        KPAGolongan,
        KPAJabatan,
        dataPegawai,
        pegawai1Nama: personilFE[0]?.pegawai?.nama,
        pegawai2Nama: personilFE[1]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai3Nama: personilFE[2]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai4Nama: personilFE[3]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai5Nama: personilFE[4]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",

        pegawai1Tingkatan: personilFE[0]?.pegawai?.daftarTingkatan.tingkatan,
        pegawai2Tingkatan:
          personilFE[1]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai3Tingkatan:
          personilFE[2]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai4Tingkatan:
          personilFE[3]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai5Tingkatan:
          personilFE[4]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",

        pegawai1Pangkat: personilFE[0]?.pegawai?.daftarPangkat.pangkat,
        pegawai2Pangkat:
          personilFE[1]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai3Pangkat:
          personilFE[2]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai4Pangkat:
          personilFE[3]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai5Pangkat:
          personilFE[4]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        noSpd1:
          Array.isArray(noSpd) && noSpd[0]
            ? noSpd[0].nomorSPD
            : "TIDAK ADA NOMOR",
        noSpd2:
          Array.isArray(noSpd) && noSpd[1]
            ? noSpd[1].nomorSPD
            : "TIDAK ADA NOMOR",
        noSpd3:
          Array.isArray(noSpd) && noSpd[2]
            ? noSpd[2].nomorSPD
            : "TIDAK ADA NOMOR",
        noSpd4:
          Array.isArray(noSpd) && noSpd[3]
            ? noSpd[3].nomorSPD
            : "TIDAK ADA NOMOR",
        noSpd5:
          Array.isArray(noSpd) && noSpd[4]
            ? noSpd[4].nomorSPD
            : "TIDAK ADA NOMOR",

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
          "undangan",
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
              {
                model: status,
                attributes: ["id", "statusKuitansi"],
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
            ],
          },
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
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: bendahara,
            attributes: ["id"],
            include: [{ model: sumberDana }],
          },
          // {
          //   model: ttdSuratTugas,
          //   attributes: ["nama", "id", "nip", "jabatan"],
          // },
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

  getJenisPerjalanan: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await jenisPerjalanan.findAll({
        include: {
          model: sumberDanaJenisPerjalanan,
          where: { sumberDanaId: id },
        },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getPerjalananKaDis: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 15;

    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    try {
      const result = await perjalanan.findAll({
        subQuery: false, // ✅ ini akan menghindari subquery wrapping
        offset,
        limit,
        order: [
          ["tanggalPengajuan", time],
          [{ model: personil }, "id", "ASC"],
        ],
        attributes: [
          "id",
          "untuk",
          "asal",
          "dasar",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
        ],
        include: [
          {
            model: personil,

            required: true,
            include: [
              {
                model: pegawai,
                required: true,
                include: [
                  {
                    model: profesi,
                    as: "profesi",
                    attributes: ["id"],
                    where: { id: 1 },
                    required: true,
                  },
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              { model: status },
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
            model: suratKeluar,
            attributes: ["id", "nomor"],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: ttdSuratTugas,
            attributes: ["id", "jabatan", "indukUnitKerjaId"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: indukUnitKerja,
                attributes: ["id", "kodeInduk"],
                as: "indukUnitKerja_ttdSuratTugas",
                // include: [
                //   {
                //     model: daftarUnitKerja,
                //     attributes: ["id", "kode"],
                //   },
                // ],
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_KPA",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
            ],
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId"],

            required: true, // ✅ Pastikan hanya ambil yang punya relasi
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                  { model: daftarTingkatan, as: "daftarTingkatan" },
                ],
              },
              {
                model: daftarUnitKerja,
                attributes: ["id", "indukUnitKerjaId"],
                as: "unitKerja_notaDinas",
                include: [
                  {
                    model: indukUnitKerja,
                    attributes: ["id", "kodeInduk"],
                  },
                ],
              },
            ],
          },
          {
            model: jenisPerjalanan,

            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
        ],
      });
      return res.status(200).json({
        result,
        page,
        limit,
        totalRows: result.length,
        totalPage: Math.ceil(result.length / limit),
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postSuratTugasKadis: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        asal,
        kode,
        nama,
        pangkat,
        golongan,
        nip,
        jabatan,
        ttdSurTug,
        id,
        tanggalPengajuan,
        tempat,
        untuk,
        ttdSurTugJabatan,
        ttdSurTugNama,
        ttdSurTugNip,
        ttdSurTugPangkat,
        ttdSurTugGolongan,
        ttdSurTugUnitKerja,
        personilFE,
        KPANama,
        KPANip,
        KPAPangkat,
        KPAGolongan,
        KPAJabatan,
        noNotaDinas,
        noSuratTugas,
        jenis,
        unitKerja,
        dasar,
        indukUnitKerjaFE,
        ttdSurtTugKode,
      } = req.body;
      console.log(ttdSurtTugKode, indukUnitKerjaFE.kode, "TTD SURAT TUGASSS");

      const getRomanMonth = (date) => {
        const months = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ];
        return months[date.getMonth()];
      };
      function terbilang(angka) {
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
          return terbilang(angka - 10) + " Belas";
        } else if (angka < 100) {
          return (
            terbilang(Math.floor(angka / 10)) +
            " Puluh " +
            terbilang(angka % 10)
          );
        } else if (angka < 200) {
          return "Seratus " + terbilang(angka - 100);
        }
      }
      // ////////////////////TERBILANG///////////////////////
      const calculateDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const difference = Math.abs(end - start);
        return Math.round(difference / millisecondsPerDay) + 1; // Adding 1 to include both start and end dates
      };

      const daysDifference = calculateDaysDifference(
        tempat[0].tanggalBerangkat,
        tempat[tempat.length - 1].tanggalPulang
      );

      const formatTanggal = (tanggal) => {
        return new Date(tanggal).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      };
      const formattedTanggalBerangkat = new Date(
        tempat[0].tanggalBerangkat
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const formattedTanggalPulang = new Date(
        tempat[tempat.length - 1].tanggalPulang
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const formattedTanggalPengajuan = new Date(
        tanggalPengajuan
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      // Path file template
      // Ambil satu data nomor surat berdasarkan id = 1
      var nomorBaru = noSuratTugas;
      let noSpd;
      // MENGABIL NOMOR SURAT TUGAS /////////////
      const dbNoSurTug = await kadis.findOne({
        transaction,
      });
      if (!noSuratTugas) {
        //MENGAMBIL NOMOR SPD ///////////

        const dbNoSPD = await daftarNomorSurat.findOne({
          where: { indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id },
          include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 3 } }],
        });

        // Pastikan dbNoSurat ditemukan sebelum digunakan
        if (!dbNoSurTug) {
          throw new Error("Data nomor surat tidak ditemukan.");
        }

        const nomorLoket = parseInt(dbNoSurTug.nomorLoket) + 1;

        nomorBaru = dbNoSurTug.nomorSurat.replace(
          "BULAN",
          getRomanMonth(new Date(tanggalPengajuan))
        );

        // Update data perjalanan
        await perjalanan.update(
          { noSuratTugas: nomorBaru },
          { where: { id }, transaction }
        );

        let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);

        console.log(dbNoSPD.jenisSurat.nomorSurat, "TES");

        const codeNoSPD =
          ttdSurtTugKode === indukUnitKerjaFE.kode
            ? ttdSurtTugKode
            : ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;

        noSpd = personilFE.map((item, index) => ({
          nomorSPD: dbNoSPD.jenisSurat.nomorSurat
            .replace("NOMOR", (nomorAwalSPD + index + 1).toString())
            .replace("KODE", codeNoSPD)
            .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan))),
        }));

        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: dbNoSPD.id }, transaction }
        );
        /////////////////////////////////////////////////////

        const codeSurTug =
          ttdSurtTugKode === indukUnitKerjaFE.kode
            ? ttdSurtTugKode
            : ttdSurtTugKode + "/" + indukUnitKerjaFE.kode;

        for (const [index, item] of personilFE.entries()) {
          await personil.update(
            {
              nomorSPD: noSpd[index].nomorSPD,
              statusId: 1,
            },
            {
              where: { id: item.id }, // Pastikan ada kriteria unik
            }
          );
        }
        /////////////////////////////////////////
      } else {
        noSpd = personilFE.map((item, index) => ({
          nomorSPD: item.nomorSPD,
        }));
      }

      const templatePath = path.join(
        __dirname,
        "../public",
        dbNoSurTug.template
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
        // tempat1: jenis.id === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        // tempat2: tempat[1]?.tempat || "",
        jumlahHari: `${daysDifference} (${terbilang(daysDifference)}) hari`,
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

        tempat1: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempat2: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,
        tempat3: jenis === 1 ? tempat[0]?.tempat : tempat[0]?.dalamKota.nama,

        tempat4:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "Tana Paser",

        tempat5:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "",

        tempat6:
          tempat.length > 1
            ? jenis === 1
              ? tempat[1]?.tempat
              : tempat[1]?.dalamKota.nama
            : "",

        tempat7:
          tempat.length === 1
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : tempat.length === 2 && jenis === 1
            ? "Tana Paser"
            : tempat.length === 2 && jenis !== 1
            ? ""
            : "Tana Paser",

        tempat8:
          tempat.length === 1 || tempat.length === 2
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "", // Default value if none of the conditions match

        tempat9:
          tempat.length === 1 || tempat.length === 2
            ? ""
            : tempat.length === 3 && jenis === 1
            ? tempat[2]?.tempat
            : tempat.length === 3 && jenis !== 1
            ? tempat[2]?.dalamKota.nama
            : "", // Default value if none of the conditions match

        tempat10: tempat.length === 3 ? "Tana Paser" : "",

        tanggal1: formatTanggal(tempat[0]?.tanggalBerangkat),
        tanggal2: formatTanggal(tempat[0]?.tanggalBerangkat),
        tanggal3:
          tempat.length === 1
            ? formatTanggal(tempat[0]?.tanggalPulang)
            : formatTanggal(tempat[1]?.tanggalBerangkat),
        tanggal4:
          tempat.length === 1 ? "" : formatTanggal(tempat[1]?.tanggalBerangkat),

        tanggal5:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? formatTanggal(tempat[1]?.tanggalPulang)
            : formatTanggal(tempat[2]?.tanggalBerangkat),

        tanggal6:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? ""
            : formatTanggal(tempat[2]?.tanggalBerangkat),

        tanggal7:
          tempat.length === 1
            ? ""
            : tempat.length === 2
            ? ""
            : formatTanggal(tempat[2]?.tanggalPulang),

        tanggalBerangkat: formattedTanggalBerangkat,
        tanggalPulang: formattedTanggalPulang,
        tanggalBerangkat1: tempat[0]?.tanggalBerangkat,
        tanggalPulang1: tempat[0]?.tanggalPulang,
        asal,
        kode,
        dasar: dasar ? dasar : noNotaDinas,
        noSurTug: nomorBaru,
        ttdSurTug,
        id,
        tanggalPengajuan: formattedTanggalPengajuan,
        tempat,
        untuk,
        ttdSurTugJabatan,
        ttdSurTugNama,
        ttdSurTugNip,
        ttdSurTugPangkat,
        ttdSurTugGolongan,
        KPANama,
        KPANip,
        KPAPangkat,
        KPAGolongan,
        KPAJabatan,
        nama,
        pangkat,
        golongan,
        nip,
        jabatan,
        pegawai1Nama: personilFE[0]?.pegawai?.nama,
        pegawai2Nama: personilFE[1]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai3Nama: personilFE[2]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai4Nama: personilFE[3]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",
        pegawai5Nama: personilFE[4]?.pegawai?.nama || "TIDAK ADA PEGAWAI !",

        pegawai1Tingkatan: personilFE[0]?.pegawai?.daftarTingkatan.tingkatan,
        pegawai2Tingkatan:
          personilFE[1]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai3Tingkatan:
          personilFE[2]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai4Tingkatan:
          personilFE[3]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",
        pegawai5Tingkatan:
          personilFE[4]?.pegawai?.daftarTingkatan.tingkatan ||
          "TIDAK ADA PEGAWAI !",

        pegawai1Pangkat: personilFE[0]?.pegawai?.daftarPangkat.pangkat,
        pegawai2Pangkat:
          personilFE[1]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai3Pangkat:
          personilFE[2]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai4Pangkat:
          personilFE[3]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",
        pegawai5Pangkat:
          personilFE[4]?.pegawai?.daftarPangkat.pangkat ||
          "TIDAK ADA PEGAWAI !",

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
  deletePerjalanan: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await perjalanan.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  cetakNotaDinas: async (req, res) => {
    console.log(req.body);
    const transaction = await sequelize.transaction();
    try {
      const {
        pegawai,
        tanggalPengajuan,
        kodeRekeningFE,
        sumber,
        untuk,
        dataTtdSurTug,
        dataTtdNotaDinas,
        ttdNotDis,

        perjalananKota,

        jenis,
        dalamKota,

        isSrikandi,
        jenisPerjalanan,
        indukUnitKerjaId,
        tempat,
        noNotDis,
      } = req.body;
      const pelayananKesehatanId = req.body.pelayananKesehatanId || 1;

      const calculateDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const difference = Math.abs(end - start);
        return Math.round(difference / millisecondsPerDay) + 1; // Adding 1 to include both start and end dates
      };
      function terbilang(angka) {
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
          return terbilang(angka - 10) + " Belas";
        } else if (angka < 100) {
          return (
            terbilang(Math.floor(angka / 10)) +
            " Puluh " +
            terbilang(angka % 10)
          );
        } else if (angka < 200) {
          return "Seratus " + terbilang(angka - 100);
        }
      }
      const getRomanMonth = (date) => {
        const months = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ];
        return months[date.getMonth()];
      };
      console.log(dalamKota, perjalananKota);

      // Ambil satu data nomor surat berdasarkan id = 2
      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],

        transaction, // Letakkan dalam objek konfigurasi yang sama
      });

      // Pastikan dbNoSurat ditemukan sebelum digunakan
      if (!dbNoSurat) {
        throw new Error("Data nomor surat tidak ditemukan.");
      }

      // Ubah format tanggalPengajuan
      const formattedTanggalPengajuan = new Date(
        tanggalPengajuan
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // console.log(resultSuratKeluar.id, "CEKDISINI");

      var dataPegawai = pegawai.map((item, index) => ({
        nama: item.pegawai.nama,
        nip: item.pegawai.nip,
        jumlahPersonil: "",
        index: index + 1,
      }));

      dataPegawai[0].jumlahPersonil = "Jumlah Personil";

      let dataKota = []; // Inisialisasi dataKota sebagai array kosong
      let dataDalamKota = [];
      if (jenis.tipePerjalananId === 2) {
        // Buat data kota tujuan
        dataKota = perjalananKota.map((item) => ({
          tempat: item.kota,
          tanggalBerangkat: item.tanggalBerangkat,
          tanggalPulang: item.tanggalPulang,
          dalamKotaId: 1,
        }));
      } else if (jenis.tipePerjalananId === 1) {
        dataDalamKota = dalamKota.map((item) =>
          // console.log(item),
          ({
            tempat: "dalam kota",
            dalamKotaId: item.dataDalamKota.id,
            tanggalBerangkat: item.tanggalBerangkat,
            tanggalPulang: item.tanggalPulang,
          })
        );
      }
      // console.log(dataDalamKota);
      // Path file template

      const template = await indukUnitKerja.findOne(
        {
          where: { id: indukUnitKerjaId },
          attributes: ["id", "templateNotaDinas"],
        },
        { transaction }
      );

      const tanggalBerangkatFE = tempat[0].tanggalBerangkat;

      const tanggalPulangFE = tempat[tempat.length - 1].tanggalPulang;

      const daysDifference = calculateDaysDifference(
        tanggalBerangkatFE,
        tanggalPulangFE
      );
      const formattedTanggalBerangkat = new Date(
        tanggalBerangkatFE
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const formattedTanggalPulang = new Date(
        tanggalPulangFE
      ).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const templatePath = path.join(
        __dirname,
        "../public",
        template.templateNotaDinas
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
      console.log(dataKota, dalamKota, jenis);
      doc.render({
        dataPegawai,
        tanggalPengajuan: formattedTanggalPengajuan,
        untuk,
        ttd: isSrikandi ? "${ttd_pengirim}" : "",
        tempat1: jenis === 1 ? tempat[0]?.tempat : tempat[0].dalamKota.nama,
        tempat2:
          jenis === 2
            ? tempat.length === 1
              ? ""
              : tempat[1]?.dalamKota.nama
            : tempat.length === 1
            ? ""
            : tempat[1]?.tempat,
        tempat3:
          jenis === 2
            ? tempat.length === 1
              ? ""
              : tempat[2]?.dalamKota.nama
            : tempat.length === 1
            ? ""
            : tempat[2]?.tempat,

        kode: kodeRekeningFE,
        noNotDis,
        ttdSurtTugJabatan: dataTtdSurTug.jabatan,
        ttdNotDinNama: dataTtdNotaDinas.pegawai_notaDinas.nama,
        ttdNotDinPangkat:
          dataTtdNotaDinas.pegawai_notaDinas.daftarPangkat.pangkat,
        ttdNotDinGolongan:
          dataTtdNotaDinas.pegawai_notaDinas.daftarGolongan.golongan,
        ttdNotDinJabatan: dataTtdNotaDinas.jabatan,
        ttdNotDinNip: `NIP. ${dataTtdNotaDinas.pegawai_notaDinas.nip}`,
        sumber,
        jenis: jenisPerjalanan,
        tanggalBerangkat: formattedTanggalBerangkat,
        tanggalPulang: formattedTanggalPulang,
        jumlahHari: `${daysDifference} (${terbilang(daysDifference)}) hari`,
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

  editPerjalanan: async (req, res) => {
    try {
      const { untuk, subKegiatanId } = req.body;
      const id = req.params.id;
      console.log(req.body);
      const result = await perjalanan.update(
        {
          untuk,
          subKegiatanId,
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
