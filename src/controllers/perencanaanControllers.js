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
  namaTarget,
  targetTriwulan,
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
              {
                model: targetTriwulan,
                attributes: ["id", "nilai"],
                include: [{ model: namaTarget, attributes: ["nama", "id"] }],
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
              {
                model: targetTriwulan,
                attributes: ["id", "nilai"],
                include: [{ model: namaTarget, attributes: ["nama", "id"] }],
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
              {
                model: targetTriwulan,
                attributes: ["id", "nilai"],
                include: [{ model: namaTarget, attributes: ["nama", "id"] }],
              },
            ],
          },
          // { model: kegiatan },
          // { model: program },
          { model: satuanIndikator },
        ],
      });
      const resultJenisAnggaran = await jenisAnggaran.findAll({});
      const resultNamaTarget = await namaTarget.findAll({});
      return res.status(200).json({
        result,
        resultJenisAnggaran,
        resultProgram,
        resultKegiatan,
        resultNamaTarget,
      });
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
                  {
                    model: targetTriwulan,
                    attributes: ["id", "nilai"],
                    include: [
                      { model: namaTarget, attributes: ["nama", "id"] },
                    ],
                  },
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

  getDetailKegiatan: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDNya");
    try {
      const result = await kegiatan.findOne({
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
                  { model: targetTriwulan },
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

  getDetailProgram: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDNya");
    try {
      const result = await program.findOne({
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
                  {
                    model: targetTriwulan,
                    attributes: ["id", "nilai"],
                    include: [
                      { model: namaTarget, attributes: ["nama", "id"] },
                    ],
                  },
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
    // console.log(req.body, "cek");
    const { indikatorId, targets, tahun, anggaran, jenisAnggaranId } = req.body;

    // Validasi input
    if (
      !indikatorId ||
      !targets ||
      !Array.isArray(targets) ||
      targets.length === 0
    ) {
      return res.status(400).json({
        error: "indikatorId dan targets array harus disediakan",
      });
    }

    try {
      // Mulai transaksi untuk memastikan konsistensi data
      const transaction = await sequelize.transaction();

      try {
        // const cekTahun = await tahunAnggaran.findOne(
        //   {
        //     where: { tahun, jenisAnggaranId: 1 },
        //   },
        //   { transaction }
        // );
        // console.log(cekTahun);
        // if (cekTahun) {
        //   return res.status(400).json({
        //     error: "anggaran sudah ada",
        //   });
        // }

        // Buat target utama
        const result = await target.create(
          {
            indikatorId,
          },
          { transaction }
        );

        // Siapkan data untuk bulk insert targetTriwulan
        const targetTriwulanData = targets.map((targetItem) => ({
          nilai: targetItem.nilai,
          namaTargetId: targetItem.namaTargetId,
          targetId: result.id,
        }));

        // Bulk insert ke targetTriwulan
        const resultTriwulan = await targetTriwulan.bulkCreate(
          targetTriwulanData,
          {
            transaction,
          }
        );

        // Buat tahunAnggaran
        const resultAnggaran = await tahunAnggaran.create(
          {
            tahun,
            anggaran,
            jenisAnggaranId,
            targetId: result.id,
          },
          { transaction }
        );

        // Commit transaksi
        await transaction.commit();

        return res.status(200).json({
          message: "Data berhasil disimpan",
          result: {
            target: result,
            targetTriwulan: resultTriwulan,
            tahunAnggaran: resultAnggaran,
          },
        });
      } catch (error) {
        // Rollback transaksi jika ada error
        await transaction.rollback();
        throw error;
      }
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
  postAnggaranPerubahan: async (req, res) => {
    const { targetId, anggaran, tahun } = req.body;
    console.log(req.body);
    try {
      const result = await tahunAnggaran.create({
        targetId,
        anggaran,
        jenisAnggaranId: 2,
        tahun,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
