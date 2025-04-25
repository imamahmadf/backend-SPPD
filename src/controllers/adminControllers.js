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
                  "unitKerjaId",
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
  getSuratKeluar: async (req, res) => {
    const indukUnitKerjaId = req.query.indukUnitKerjaId || 1;
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
    const { unitKerja, dataKodeKlasifikasi, tujuan, perihal, tanggalSurat } =
      req.body;
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
        where: { indukUnitKerjaId: unitKerja.indukUnitKerja.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],
        transaction,
      });
      const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;

      console.log("NOMOR LOKET", nomorLoket);
      const nomor = dbNoSurat.jenisSurat.nomorSurat
        .replace("NOMOR", nomorLoket.toString())
        .replace("KLASIFIKASI", dataKodeKlasifikasi)
        .replace(
          "KODE",
          unitKerja.indukUnitKerja.kodeInduk + "/" + unitKerja.kode
        )
        .replace("BULAN", getRomanMonth(new Date(tanggalSurat)));
      await daftarNomorSurat.update(
        { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSurat.id }, transaction }
      );

      const result = await suratKeluar.create(
        {
          nomor,
          indukUnitKerjaId: unitKerja.indukUnitKerja.id,
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
};
