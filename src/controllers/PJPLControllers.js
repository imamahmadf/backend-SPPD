const {
  sequelize,
  user,
  userRole,
  role,
  profile,
  pejabatVerifikator,
  pegawai,
  indikatorPejabat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  profesi,
  statusPegawai,
  kontrakPJPL,
  kinerjaPJPL,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  // tes: async (req, res) => {
  //   try {
  //     const resultUser = await user.findOne({
  //       where: { email: "tes@mail.com" },
  //       include: [
  //         { model: userRole, include: [{ model: role, attributes: ["nama"] }] },
  //         {
  //           model: profile,
  //           attributes: ["id", "nama", "profilePic"],
  //           include: [
  //             {
  //               model: daftarUnitKerja,
  //               attributes: ["id"],
  //               as: "unitKerja-profile",
  //             },
  //           ],
  //         },
  //       ],
  //     });
  //     return res.status(200).json({ resultUser });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // },

  getPejabatVerifikator: async (req, res) => {
    try {
      const result = await pejabatVerifikator.findAll({
        attributes: [
          "id",
          "pegawaiId",
          "unitKerjaId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          { model: pegawai, attributes: ["id", "nama", "NIP", "jabatan"] },
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postPejabatVerifikator: async (req, res) => {
    const { pegawaiId, unitKerjaId } = req.body;

    console.log("test", pegawaiId);
    try {
      const result = await pejabatVerifikator.create({
        pegawaiId,
        unitKerjaId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postIndikator: async (req, res) => {
    const { indikator, pejabatVerifikatorId } = req.body;

    console.log("test", indikator);
    try {
      const result = await indikatorPejabat.create({
        indikator,
        pejabatVerifikatorId,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  // getIndikatorPejabat: async (req, res) => {
  //   const id = req.params.id;
  //   console.log("ID PEH+GAWAI", id);
  //   try {
  //     const result = await indikatorPejabat.findAll({
  //       include: [
  //         {
  //           model: pejabatVerifikator,
  //           attributes: ["id"],
  //           require: true,
  //           where: { pegawaiId: id },
  //         },
  //       ],
  //     });
  //     return res.status(200).json({ result });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // },

  getIndikatorPejabat: async (req, res) => {
    const id = req.params.id;
    console.log("ID PEH+GAWAI", id);
    try {
      const result = await pejabatVerifikator.findOne({
        attributes: ["id"],
        include: [
          {
            model: indikatorPejabat,
            attributes: ["id", "indikator"],
          },
        ],
        where: { pegawaiId: id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getIndikatorKinerja: async (req, res) => {
    const unitKerjaId = req.params.id;
    console.log("ID PEH+GAWAI", unitKerjaId);
    try {
      const result = await indikatorPejabat.findAll({
        attributes: ["id", "indikator"],
        include: [
          {
            model: pejabatVerifikator,
            attributes: ["id"],
            where: { unitKerjaId },
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getPJPLPegawai: async (req, res) => {
    const indukUnitKerjaId = req.body.id;
    const pegawaiWhere = { statusPegawaiId: 4 };
    const unitKerjaWhere = {};

    if (indukUnitKerjaId) {
      unitKerjaWhere.indukUnitKerjaId = indukUnitKerjaId;
    }

    const daftarUnitKerjaInclude = {
      model: daftarUnitKerja,
      as: "daftarUnitKerja",
      attributes: ["id", "unitKerja", "indukUnitKerjaId"],
    };

    if (Object.keys(unitKerjaWhere).length > 0) {
      daftarUnitKerjaInclude.where = unitKerjaWhere;
    }

    try {
      const result = await pegawai.findAll({
        where: pegawaiWhere,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `ASC`],
        ],
        attributes: ["id", "nama", "nip", "jabatan", "pendidikan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: profesi, as: "profesi" },
          { model: statusPegawai, as: "statusPegawai" },
          daftarUnitKerjaInclude,
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postKontrak: async (req, res) => {
    const { tanggalAwal, tanggalAkhir, pegawaiIds } = req.body;

    try {
      // Siapkan array object untuk bulkCreate
      const kontrakData = pegawaiIds.map((id) => ({
        tanggalAwal,
        tanggalAkhir,
        pegawaiId: id,
      }));

      const result = await kontrakPJPL.bulkCreate(kontrakData);

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKontrakPegawai: async (req, res) => {
    const { id } = req.params;
    console.log("berhail masuk");

    try {
      const result = await kontrakPJPL.findAll({ where: { pegawaiId: id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getDetailKontrak: async (req, res) => {
    const { id } = req.params;
    console.log("berhasil masuk");

    try {
      const result = await kontrakPJPL.findAll({
        where: { id },
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id"],
            include: [
              {
                model: indikatorPejabat,
                attributes: ["id"],
                include: [
                  {
                    model: pejabatVerifikator,
                    attributes: [
                      "id",
                      "pegawaiId",
                      "unitKerjaId",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
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
};
