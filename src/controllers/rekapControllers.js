const {
  daftarUnitKerja,
  daftarSubKegiatan,
  personil,
  ttdNotaDinas,
  pegawai,
  perjalanan,
  tempat,
  dalamKota,
  jenisPerjalanan,
  tipePerjalanan,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getPerjalanan: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;
    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

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

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }
    try {
      const result = await perjalanan.findAll({
        limit,
        offset,
        subQuery: false,
        where: whereConditionSubKegiatan,
        include: [
          {
            model: personil,
            attributes: ["id", "nomorSPD"],
            include: [{ model: pegawai, attributes: ["nama", "nip"] }],
            where: whereConditionPegawaiId,
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId"],
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat, // <- Filter terapkan di sini
            attributes: ["id", "tanggalBerangkat", "tanggalPulang", "tempat"],
            include: [
              { model: dalamKota, attributes: ["id", "nama"], as: "dalamKota" },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
          },
        ],
        attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      const totalRows = await perjalanan.count({
        where: whereConditionSubKegiatan,
        include: [
          {
            model: ttdNotaDinas,
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat,
          },
        ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
