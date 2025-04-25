const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getPegawai: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
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
  getDaftarPegawai: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;

    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    try {
      const result = await pegawai.findAll({
        offset,
        limit,
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
        ],
      });
      const totalRows = await pegawai.count({});
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getOnePegawai: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pegawai.findOne({
        where: { id },
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
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
  getSeedPegawai: async (req, res) => {
    try {
      const resultGolongan = await daftarGolongan.findAll({});
      const resultPangkat = await daftarPangkat.findAll({});
      const resultTingkatan = await daftarTingkatan.findAll({});

      return res
        .status(200)
        .json({ resultGolongan, resultPangkat, resultTingkatan });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  editPegawai: async (req, res) => {
    const { id, dataPegawai } = req.body;
    console.log(req.body);
    try {
      const result = await pegawai.update(
        {
          nama: dataPegawai.nama,
          jabatan: dataPegawai.jabatan,
          nip: dataPegawai.nip,
          golonganId: dataPegawai.daftarGolongan.id,
          tingkatanId: dataPegawai.daftarTingkatan.id,
          pangkatId: dataPegawai.daftarPangkat.id,
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
};
