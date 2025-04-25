const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getDalamKota: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await dalamKota.findAll({
        attributes: ["id", "nama", "durasi", "uangTransport"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
