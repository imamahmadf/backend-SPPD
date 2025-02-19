const { perjalanan, pegawai, golongan, pangkat } = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getPegawai: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        include: [
          {
            model: golongan,
          },
          { model: pangkat },
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
