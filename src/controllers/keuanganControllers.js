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
  bendahara,
} = require("../models");

const { Op } = require("sequelize");

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
};
