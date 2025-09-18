const {
  rincianBPD,
  rill,
  daftarUnitKerja,
  sequelize,
  user,
  userRole,
  role,
  profile,
  program,
  kegiatan,
  subKegPer,
  indikator,
  target,
  satuanIndikator,
  tahunAnggaran,
  jenisAnggaran,
  capaian,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getAllProgram: async (req, res) => {
    try {
      const result = await program.findAll({
        include: [
          {
            model: kegiatan,
            include: [
              {
                model: subKegPer,
                include: [
                  { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
                ],
              },
            ],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getAllIndikator: async (req, res) => {
    const id = req.params.id;
    const { tahun, jenisAnggaranId } = req.query;
    const whereCondition = {};

    if (tahun) {
      whereCondition.tahun = tahun;
    }

    if (jenisAnggaranId) {
      whereCondition.jenisAnggaranId = jenisAnggaranId;
    }
    try {
      const result = await indikator.findAll({
        include: [
          {
            model: subKegPer,
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
                where: { id },
                required: true,
              },
            ],
          },
          {
            model: target,

            include: [
              {
                model: tahunAnggaran,
                // where: whereCondition,

                include: [{ model: jenisAnggaran }],
              },
            ],
          },
          // { model: kegiatan },
          // { model: program },
          { model: satuanIndikator },
        ],
      });

      const resultProgram = await indikator.findAll({
        include: [
          {
            model: program,
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
                where: { id },
                required: true,
              },
            ],
          },
          {
            model: target,

            include: [
              {
                model: tahunAnggaran,
                // where: whereCondition,

                include: [{ model: jenisAnggaran }],
              },
            ],
          },
          // { model: kegiatan },
          // { model: program },
          { model: satuanIndikator },
        ],
      });

      const resultKegiatan = await indikator.findAll({
        include: [
          {
            model: kegiatan,
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
                where: { id },
                required: true,
              },
            ],
          },
          {
            model: target,

            include: [
              {
                model: tahunAnggaran,
                // where: whereCondition,

                include: [{ model: jenisAnggaran }],
              },
            ],
          },
          // { model: kegiatan },
          // { model: program },
          { model: satuanIndikator },
        ],
      });
      const resultJenisAnggaran = await jenisAnggaran.findAll({});
      return res
        .status(200)
        .json({ result, resultJenisAnggaran, resultProgram, resultKegiatan });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getDetailSubKegiatan: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDNya");
    try {
      const result = await subKegPer.findOne({
        where: { id },
        include: [
          {
            model: indikator,
            include: [
              {
                model: target,

                include: [
                  {
                    model: tahunAnggaran,
                    // where: whereCondition,

                    include: [{ model: jenisAnggaran }],
                  },
                  { model: capaian },
                ],
              },
              { model: satuanIndikator },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postTarget: async (req, res) => {
    const { indikatorId, nilai, tahun, anggaran, jenisAnggaranId } = req.body;
    try {
      const result = await target.create({
        indikatorId,
        nilai,
      });

      const resultAnggaran = await tahunAnggaran.create({
        tahun,
        anggaran,
        jenisAnggaranId,
        targetId: result.id,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postCapaian: async (req, res) => {
    const { targetId, nilai, bulan, anggaran } = req.body;
    console.log(req.body);
    try {
      const result = await capaian.create({ targetId, nilai, bulan, anggaran });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
