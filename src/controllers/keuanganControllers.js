const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  sumberDana,
  indukUKSumberDana,
  indukUnitKerja,
  jenisPerjalanan,
  bendahara,
} = require("../models");

const { Op, where } = require("sequelize");

module.exports = {
  getBendahara: async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
      const result = await sumberDana.findAll({
        include: [
          {
            model: bendahara,
            include: [
              {
                model: pegawai,
                foreignKey: "pegawaiId",
                as: "pegawai_bendahara",
                require: true,
                attributes: ["id", "nama"],
              },
            ],
            attributes: ["id", "jabatan"],
            where: { indukUnitKerjaId: id },
            require: true,
          },
        ],
        attributes: ["id", "sumber"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postBendahara: async (req, res) => {
    const { pegawaiId, indukUnitKerjaId, sumberDanaId, jabatan } = req.body;
    try {
      const result = await bendahara.create({
        pegawaiId,
        indukUnitKerjaId,
        sumberDanaId,
        jabatan,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getSumberDana: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    try {
      const result = await sumberDana.findAll({
        include: [
          {
            model: indukUKSumberDana,
            attributes: ["id"],
            where: { indukUnitKerjaId },
          },
        ],
        attributes: ["id", "sumber"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteBendahara: async (req, res) => {
    const id = req.params.id;
    try {
      const result = await bendahara.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllSumberDana: async (req, res) => {
    try {
      const result = await sumberDana.findAll({});
      const resultJenisPerjalanan = await jenisPerjalanan.findAll({});
      return res.status(200).json({ result, resultJenisPerjalanan });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  editSumberDana: async (req, res) => {
    const { id } = req.params;
    const { untukPembayaran, kalimat1, kalimat2 } = req.body;
    try {
      const result = await sumberDana.update(
        {
          untukPembayaran,
          kalimat1,
          kalimat2,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
