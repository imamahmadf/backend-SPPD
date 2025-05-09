const {
  pegawai,
  daftarNomorSurat,
  jenisSurat,
  sumberDana,
} = require("../models");

module.exports = {
  getNomorSurat: async (req, res) => {
    const indukUnitKerjaId = req.params.id;
    console.log(indukUnitKerjaId);
    try {
      const result = await daftarNomorSurat.findAll({
        where: { indukUnitKerjaId },
        include: [{ model: jenisSurat, as: "jenisSurat" }],
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
