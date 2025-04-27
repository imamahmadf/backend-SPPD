const { Op } = require("sequelize");
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
  sumberDana,
  bendahara,
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
        kodeKlasifikasi,
        dataBendaharaId,
      } = req.body;

      console.log(req.body.kodeKlasifikasi, "KODE KLASIFIKASI");
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
      const tanggalBerangkatFE = dalamKota ? dalamKota[0].tanggalBerangkat : "";
      const tanggalPulangFE = dalamKota
        ? dalamKota[dalamKota.length - 1].tanggalBerangkat
        : "";
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

      // Buat nomor baru dengan mengganti "NOMOR" dengan nomorLoket
      const nomorBaru = dbNoSurat.jenisSurat.nomorSurat
        .replace("NOMOR", nomorLoket.toString())
        .replace("KLASIFIKASI", kodeKlasifikasi.value.kode)
        .replace(
          "KODE",
          indukUnitKerjaFE.indukUnitKerja.kodeInduk +
            "/" +
            indukUnitKerjaFE.kode
        )
        .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan)));

      const resultSuratKeluar = await suratKeluar.create({
        nomor: nomorBaru,
        indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id,
      });

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

      console.log(resultSuratKeluar.id, "CEKDISINI");
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
          PPTKId,
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
      if (jenis.id === 1) {
        // Buat data kota tujuan
        dataKota = perjalananKota.map((item) => ({
          perjalananId: dbPerjalanan.id,
          tempat: item.kota,
          tanggalBerangkat: item.tanggalBerangkat,
          tanggalPulang: item.tanggalPulang,
          dalamKotaId: 1,
        }));

        await tempat.bulkCreate(dataKota, { transaction });
      } else if (jenis.id === 2) {
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

      const template = await indukUnitKerja.findOne(
        {
          where: { id: indukUnitKerjaFE.indukUnitKerja.id },
          attributes: ["id", "templateNotaDinas"],
        },
        { transaction }
      );

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

      doc.render({
        dataPegawai,
        tanggalPengajuan: formattedTanggalPengajuan,
        untuk,
        tempat1:
          jenis.id === 1
            ? dataKota[0]?.tempat
            : dalamKota[0].dataDalamKota.nama,
        // tempat2:
        //   jenis.id === 1
        //     ? dataKota[1]?.tempat
        //     : dalamKota[1].dataDalamKota.nama || "",
        // tempat3: dataKota[2]?.tempat || "",
        kode: kodeRekeningFE,
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
      const resultDaftarKegiatan = await daftarKegiatan.findAll({
        attributes: ["id", "kegiatan", "kodeRekening", "sumber"],
        include: [
          {
            model: daftarSubKegiatan,
            as: "subKegiatan", // Sesuai dengan alias di model
          },
        ],
      });
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
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
      return res.status(200).json({
        resultDaftarKegiatan,
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
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log(unitKerjaId, "INI UNIT KERJA");
    try {
      const result = await perjalanan.findAll({
        offset,
        limit,
        order: [["tanggalPengajuan", time]],
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
                  { model: daftarTingkatan, as: "daftarTingkatan" },
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
                include: [
                  {
                    model: daftarUnitKerja,
                    attributes: ["id", "kode"],
                  },
                ],
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id"],
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
            where: { unitKerjaId }, // ✅ Filter data berdasarkan unit kerja yang diminta
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
          { model: jenisPerjalanan },
        ],
      });

      const totalRows = await perjalanan.count({
        include: [
          {
            model: ttdNotaDinas,
            where: { unitKerjaId },
            required: true,
          },
        ],
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
        noNotaDinas,
        noSuratTugas,
        jenis,
        unitKerja,
        indukUnitKerjaFE,
      } = req.body;
      console.log(ttdSurTugUnitKerja);
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
        const dbNoSurat = await daftarNomorSurat.findOne({
          where: { indukUnitKerjaId: ttdSurTugUnitKerja },
          include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 1 } }],

          transaction, // Letakkan dalam objek konfigurasi yang sama
        });

        const dbNoSPD = await daftarNomorSurat.findOne({
          where: { indukUnitKerjaId: indukUnitKerjaFE.indukUnitKerja.id },
          include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 3 } }],
        });

        // Pastikan dbNoSurat ditemukan sebelum digunakan
        if (!dbNoSurat) {
          throw new Error("Data nomor surat tidak ditemukan.");
        }

        const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;

        nomorBaru = dbNoSurat.jenisSurat.nomorSurat
          .replace("NOMOR", nomorLoket.toString())
          .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan)))
          .replace(
            "KODE",
            indukUnitKerjaFE.indukUnitKerja.kodeInduk +
              "/" +
              indukUnitKerjaFE.kode
          );
        console.log(dbNoSurat.id, "NOMOR SURAT");
        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: dbNoSurat.id }, transaction }
        );

        // Update data perjalanan
        await perjalanan.update(
          { noSuratTugas: nomorBaru },
          { where: { id }, transaction }
        );

        let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);

        console.log(dbNoSPD.jenisSurat.nomorSurat, "TES");

        noSpd = personilFE.map((item, index) => ({
          nomorSPD: dbNoSPD.jenisSurat.nomorSurat
            .replace("NOMOR", (nomorAwalSPD + index + 1).toString())
            .replace(
              "KODE",
              indukUnitKerjaFE.indukUnitKerja.kodeInduk +
                "/" +
                indukUnitKerjaFE.kode
            )
            .replace("BULAN", getRomanMonth(new Date(tanggalPengajuan))),
        }));

        // Update nomor loket ke database
        await daftarNomorSurat.update(
          { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
          { where: { id: dbNoSPD.id }, transaction }
        );
        /////////////////////////////////////////////////////
        for (const [index, item] of personilFE.entries()) {
          await personil.update(
            {
              nomorSPD: dbNoSPD.jenisSurat.nomorSurat
                .replace("NOMOR", (nomorAwalSPD + index + 1).toString())
                .replace(
                  "KODE",
                  indukUnitKerjaFE.indukUnitKerja.kodeInduk +
                    "/" +
                    indukUnitKerjaFE.kode
                )
                .replace("KODE", unitKerja.kode),
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
        noNotaDinas,
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
              },
            ],
          },
          // {
          //   model: ttdSuratTugas,
          //   attributes: ["nama", "id", "nip", "jabatan"],
          // },
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
