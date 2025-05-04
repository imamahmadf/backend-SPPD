const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  rincianBPD,
  perjalanan,
  personil,
  jenisRincianBPD,
  tempat,
  jenisTempat,
  PPTK,
  rill,
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarKegiatan,
  ttdSuratTugas,
  dalamKota,
  jenisPerjalanan,
  sequelize,
  user,
  userRole,
  role,
  profile,
  indukUnitKerja,
  ttdNotaDinas,
  indukUKSumberDana,
  sumberDana,
  KPA,
} = require("../models");

module.exports = {
  getIndukUnitKerja: async (req, res) => {
    const { id } = req.params;

    try {
      const resultSumberDana = await sumberDana.findAll();
      const result = await indukUnitKerja.findOne({
        where: { id },
        attributes: ["id", "indukUnitKerja", "kodeInduk"],

        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja", "asal", "kode"],
            include: [
              {
                model: ttdNotaDinas,
                foreignKey: "unitKerjaId",
                as: "unitKerja_notaDinas",
                attributes: ["id", "jabatan"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["nama"],
                    foreignKey: "pegawaiId",
                    as: "pegawai_notaDinas",
                  },
                ],
              },

              {
                model: PPTK,
                attributes: ["id", "jabatan"],
                foreignKey: "pegawaiId",
                include: [
                  {
                    model: pegawai,
                    attributes: ["nama"],
                    foreignKey: "pegawaiId",
                    as: "pegawai_PPTK",
                  },
                ],
              },
              {
                model: KPA,
                attributes: ["id", "jabatan"],

                foreignKey: "unitKerjaId",
                include: [
                  {
                    model: pegawai,
                    attributes: ["nama"],
                    foreignKey: "pegawaiId",
                    as: "pegawai_KPA",
                  },
                ],
              },
            ],
          },
          {
            model: ttdSuratTugas,
            foreignKey: "indukUnitKerjaId",
            as: "indukUnitKerja_ttdSuratTugas",
            include: [
              {
                model: pegawai,
                attributes: ["nama"],
                foreignKey: "pegawaiId",
                as: "pegawai",
              },
            ],
          },
          {
            model: indukUKSumberDana,
            include: [{ model: sumberDana }],
          },
        ],
      });
      return res.status(200).json({ result, resultSumberDana });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteTtdSuratTugas: async (req, res) => {
    const id = req.params.id;

    try {
      const result = await ttdSuratTugas.destroy({
        where: { id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteTandaTangan: async (req, res) => {
    console.log(req.body);
    const type = req.body.data.type;
    const id = req.body.data.id;
    try {
      if (type === "notaDinas") {
        await ttdNotaDinas.destroy({
          where: { id },
        });
      } else if (type === "PPTK") {
        await PPTK.destroy({
          where: { id },
        });
      } else if (type === "KPA") {
        await KPA.destroy({
          where: { id },
        });
      }
      return res.status(200).json({ message: "Data dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  updateTtdSuratTugas: async (req, res) => {
    console.log(req.body);
    const { id, jabatan } = req.body;
    try {
      const result = await ttdSuratTugas.update(
        { jabatan },
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
  updateTandaTangan: async (req, res) => {
    console.log(req.body);
    const { type, id, jabatan } = req.body;

    try {
      if (type === "notaDinas") {
        await ttdNotaDinas.update(
          { jabatan },
          {
            where: { id },
          }
        );
      } else if (type === "PPTK") {
        await PPTK.update(
          { jabatan },
          {
            where: { id },
          }
        );
      } else if (type === "KPA") {
        await KPA.update(
          { jabatan },
          {
            where: { id },
          }
        );
      }
      return res.status(200).json({ message: "Data diupdate" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postTandaTangan: async (req, res) => {
    console.log(req.body);
    const { pegawaiId, unitKerjaId, jabatan, jenis } = req.body;
    let result;
    try {
      if (parseInt(jenis) === 1) {
        result = await ttdNotaDinas.create({
          pegawaiId,
          unitKerjaId,
          jabatan,
        });
      } else if (parseInt(jenis) === 2) {
        result = await KPA.create({ pegawaiId, unitKerjaId, jabatan });
      } else if (parseInt(jenis) === 3) {
        result = await PPTK.create({ pegawaiId, unitKerjaId, jabatan });
      }
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postUnitKerja: async (req, res) => {
    const { indukUnitKerjaId, asal, kode, unitKerja } = req.body;
    try {
      const result = await daftarUnitKerja.create({
        indukUnitKerjaId,
        asal,
        kode,
        unitKerja,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postTtdSuratTugas: async (req, res) => {
    const { indukUnitKerjaId, pegawaiId, jabatan } = req.body;
    try {
      const result = await ttdSuratTugas.create({
        indukUnitKerjaId,
        pegawaiId,
        jabatan,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getDaftarIndukUnitKerja: async (req, res) => {
    try {
      const result = await indukUnitKerja.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
