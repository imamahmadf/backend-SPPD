const {
  daftarSubKegiatan,

  profile,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getSubKegiatan: async (req, res) => {
    const unitKerjaId = req.params.unitKerjaId;
    try {
      const result = await daftarSubKegiatan.findAll({
        where: { unitKerjaId },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteSubKegiatan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await daftarSubKegiatan.destroy({
        where: { id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editSubKegiatan: async (req, res) => {
    const { id, subKegiatan, kodeRekening, anggaran } = req.body;
    try {
      const result = await daftarSubKegiatan.update({
        where: { id },
        subKegiatan,
        kodeRekening,
        anggaran,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postSubKegiatan: async (req, res) => {
    const { subKegiatan, kodeRekening, anggaran } = req.body;
    try {
      const result = await daftarSubKegiatan.create({
        subKegiatan,
        kodeRekening,
        anggaran,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
