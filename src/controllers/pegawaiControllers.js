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
          { model: daftarUnitKerja, as: "daftarUnitKerja" },
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
