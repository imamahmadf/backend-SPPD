const {
  daftarSubKegiatan,

  profile,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getSubKegiatan: async (req, res) => {
    const unitKerjaId = req.params.id;
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
    const { subKegiatan, kodeRekening, anggaran } = req.body;
    const id = req.params.id;
    console.log(req.body);
    try {
      const result = await daftarSubKegiatan.update(
        {
          subKegiatan,
          kodeRekening,
          anggaran,
        },
        {
          where: { id },
        }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postSubKegiatan: async (req, res) => {
    console.log(req.body);
    const { subKegiatan, kodeRekening, anggaran, unitKerjaId } = req.body;
    try {
      const result = await daftarSubKegiatan.create({
        subKegiatan,
        kodeRekening,
        anggaran,
        unitKerjaId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
