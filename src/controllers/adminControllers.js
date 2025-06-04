const {
  pegawai,

  daftarGolongan,
  daftarPangkat,
  perjalanan,
  personil,
  tempat,
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarKegiatan,
  rill,
  rincianBPD,
  jenisPerjalanan,
  dalamKota,
  jenisRincianBPD,
  status,
  suratKeluar,
  sequelize,
  daftarNomorSurat,
  sumberDana,
  bendahara,
  jenisSurat,
  tipePerjalanan,
  indukUnitKerja,
  ttdSuratTugas,
  ttdNotaDinas,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  detailPerjalanan: async (req, res) => {
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
          "pic",
          "dasar",
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
                required: true,
                where: {
                  id: {
                    [Op.ne]: 1, // tidak sama dengan 1
                  },
                },
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
  getSuratKeluar: async (req, res) => {
    const indukUnitKerjaId = req.query.indukUnitKerjaId;
    console.log(indukUnitKerjaId, "INDUK UNIT KERJA");
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 15;

    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    try {
      const result = await suratKeluar.findAll({
        offset,
        limit,
        order: [["createdAt", time]],
        attributes: [
          "id",
          "nomor",
          "perihal",
          "tujuan",
          "tanggalSurat",
          "createdAt",
          [sequelize.fn("COUNT", sequelize.col("suratKeluar.id")), "count"],
        ],
        where: { indukUnitKerjaId },
        include: [{ model: perjalanan, attributes: ["id"] }],
        group: ["suratKeluar.id"],
      });

      const totalRows = await suratKeluar.count({
        where: { indukUnitKerjaId },
      });

      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "kode"],
      });
      const totalPage = Math.ceil(totalRows / limit);
      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage, resultUnitKerja });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  postSuratKeluar: async (req, res) => {
    const {
      unitKerja,
      dataKodeKlasifikasi,
      tujuan,
      perihal,
      tanggalSurat,
      indukUnitKerja,
    } = req.body;
    console.log(req.body);

    const transaction = await sequelize.transaction();
    try {
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
      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: indukUnitKerja.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],
        transaction,
      });
      const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;
      const kode =
        indukUnitKerja.kodeInduk === unitKerja.kode
          ? indukUnitKerja.kodeInduk
          : indukUnitKerja.kodeInduk + "/" + unitKerja.kode;
      console.log("NOMOR LOKET", nomorLoket);
      const nomor = dbNoSurat.jenisSurat.nomorSurat
        .replace("NOMOR", nomorLoket.toString())
        .replace("KLASIFIKASI", dataKodeKlasifikasi)
        .replace("KODE", kode)
        .replace("BULAN", getRomanMonth(new Date(tanggalSurat)));
      await daftarNomorSurat.update(
        { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSurat.id }, transaction }
      );

      const result = await suratKeluar.create(
        {
          nomor,
          indukUnitKerjaId: indukUnitKerja.id,
          tujuan,
          perihal,
          tanggalSurat,
        },
        transaction
      );
      await transaction.commit();
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error("Error in postSuratKeluar:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getIndukUnitKerja: async (req, res) => {
    try {
      const result = await indukUnitKerja.findAll({
        attributes: ["id", "kodeInduk", "indukUnitKerja"],
        include: [
          { model: daftarUnitKerja, attributes: ["id", "kode", "asal"] },
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
  getUnitKerja: async (req, res) => {
    try {
      const result = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getAllPerjalananKeuangan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 15;
    const unitKerjaId = parseInt(req.query.unitKerjaId) || null;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log(unitKerjaId, "INI UNIT KERJA");

    const whereCondition = {};
    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    try {
      const result = await perjalanan.findAll({
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
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
        ],
        include: [
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId"],
            where: whereCondition, // ✅ Filter data berdasarkan unit kerja yang diminta
            required: true, // ✅ Pastikan hanya ambil yang punya relasi
          },
          {
            model: personil,
            include: [
              {
                model: pegawai,
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
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId"],

            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
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

      const totalRows = await perjalanan.count({
        include: [
          {
            model: ttdNotaDinas,
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
  deleteSuratKeluar: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDDD");
    try {
      const result = await suratKeluar.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
