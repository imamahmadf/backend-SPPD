const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
  indukUnitKerja,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getDalamKota: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    try {
      const result = await dalamKota.findAll({
        offset,
        limit,
        attributes: ["id", "nama", "durasi", "uangTransport"],
        include: [
          { model: indukUnitKerja, attributes: ["id", "indukUnitkerja"] },
        ],
      });
      const totalRows = await dalamKota.count({});
      const totalPage = Math.ceil(totalRows / limit);
      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editDalamKota: async (req, res) => {
    console.log(req.body);
    const { nama, durasi, uangTransport } = req.body.formData;
    try {
      const result = await dalamKota.update(
        { nama, durasi, uangTransport },
        { where: { id: req.body.id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getSeed: async (req, res) => {
    try {
      const result = await indukUnitKerja.findAll({
        attributes: ["id", "indukUnitKerja"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  addTujuan: async (req, res) => {
    const { nama, durasi, uangTransport, indukUnitKerjaId } = req.body;
    console.log(req.body);
    try {
      const result = await dalamKota.create({
        nama,
        durasi,
        uangTransport,
        indukUnitKerjaId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
