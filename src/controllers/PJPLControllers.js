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
  realisasiPJPL,
  hasilKerjaPJPL,
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

  // ========== KINERJA PJPL CONTROLLERS ==========
  postKinerjaPJPL: async (req, res) => {
    const { kontrakPJPLId, indikatorPejabatId, indikator, target, status } =
      req.body;

    try {
      const result = await kinerjaPJPL.create({
        kontrakPJPLId,
        indikatorPejabatId,
        indikator,
        target,
        status: status || "diajukan",
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKinerjaPJPL: async (req, res) => {
    const { kontrakPJPLId } = req.query;

    try {
      const where = {};
      if (kontrakPJPLId) {
        where.kontrakPJPLId = kontrakPJPLId;
      }

      const result = await kinerjaPJPL.findAll({
        where,
        include: [
          {
            model: kontrakPJPL,
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
            ],
          },
          {
            model: indikatorPejabat,
            attributes: ["id", "indikator"],
            include: [
              {
                model: pejabatVerifikator,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getKinerjaPJPLById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await kinerjaPJPL.findOne({
        where: { id },
        include: [
          {
            model: kontrakPJPL,
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
              },
            ],
          },
          {
            model: indikatorPejabat,
            attributes: ["id", "indikator"],
            include: [
              {
                model: pejabatVerifikator,
                attributes: ["id"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
            ],
          },
          {
            model: realisasiPJPL,
            as: "realisasiPJPLs",
            attributes: [
              "id",
              "tanggalAwal",
              "tanggalAkhir",
              "status",
              "createdAt",
            ],
            include: [
              {
                model: hasilKerjaPJPL,
                as: "hasilKerjaPJPLs",
                attributes: ["id", "hasil", "nilai", "status"],
              },
            ],
          },
        ],
      });

      if (!result) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateKinerjaPJPL: async (req, res) => {
    const { id } = req.params;
    const { indikator, target, status } = req.body;

    try {
      const kinerja = await kinerjaPJPL.findByPk(id);
      if (!kinerja) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      const updateData = {};
      if (indikator !== undefined) updateData.indikator = indikator;
      if (target !== undefined) updateData.target = target;
      if (status !== undefined) updateData.status = status;

      await kinerja.update(updateData);

      const result = await kinerjaPJPL.findByPk(id, {
        include: [
          {
            model: kontrakPJPL,
            attributes: ["id", "tanggalAwal", "tanggalAkhir"],
          },
          {
            model: indikatorPejabat,
            attributes: ["id", "indikator"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteKinerjaPJPL: async (req, res) => {
    const { id } = req.params;

    try {
      const kinerja = await kinerjaPJPL.findByPk(id);
      if (!kinerja) {
        return res.status(404).json({ error: "Kinerja PJPL tidak ditemukan" });
      }

      await kinerja.destroy();

      return res.status(200).json({ message: "Kinerja PJPL berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== REALISASI PJPL CONTROLLERS ==========
  postRealisasiPJPL: async (req, res) => {
    const { tanggalAwal, tanggalAkhir, kinerjaPJPLId, status } = req.body;

    try {
      // Validasi tanggal
      if (new Date(tanggalAwal) > new Date(tanggalAkhir)) {
        return res.status(400).json({
          error: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
        });
      }

      const result = await realisasiPJPL.create({
        tanggalAwal,
        tanggalAkhir,
        kinerjaPJPLId,
        status: status || "diajukan",
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRealisasiPJPL: async (req, res) => {
    const { kinerjaPJPLId } = req.query;

    try {
      const where = {};
      if (kinerjaPJPLId) {
        where.kinerjaPJPLId = kinerjaPJPLId;
      }

      const result = await realisasiPJPL.findAll({
        where,
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id", "indikator", "target", "status"],
            include: [
              {
                model: kontrakPJPL,
                attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
            ],
          },
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status"],
          },
        ],
        order: [["tanggalAwal", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getRealisasiPJPLById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await realisasiPJPL.findOne({
        where: { id },
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id", "indikator", "target", "status"],
            include: [
              {
                model: kontrakPJPL,
                attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                include: [
                  {
                    model: pegawai,
                    attributes: ["id", "nama", "nip", "jabatan"],
                  },
                ],
              },
              {
                model: indikatorPejabat,
                attributes: ["id", "indikator"],
              },
            ],
          },
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status", "createdAt"],
          },
        ],
      });

      if (!result) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateRealisasiPJPL: async (req, res) => {
    const { id } = req.params;
    const { tanggalAwal, tanggalAkhir, status } = req.body;

    try {
      const realisasi = await realisasiPJPL.findByPk(id);
      if (!realisasi) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      // Validasi tanggal jika ada perubahan
      if (tanggalAwal && tanggalAkhir) {
        if (new Date(tanggalAwal) > new Date(tanggalAkhir)) {
          return res.status(400).json({
            error: "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
          });
        }
      }

      const updateData = {};
      if (tanggalAwal !== undefined) updateData.tanggalAwal = tanggalAwal;
      if (tanggalAkhir !== undefined) updateData.tanggalAkhir = tanggalAkhir;
      if (status !== undefined) updateData.status = status;

      await realisasi.update(updateData);

      const result = await realisasiPJPL.findByPk(id, {
        include: [
          {
            model: kinerjaPJPL,
            attributes: ["id", "indikator", "target"],
          },
          {
            model: hasilKerjaPJPL,
            as: "hasilKerjaPJPLs",
            attributes: ["id", "hasil", "nilai", "status"],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteRealisasiPJPL: async (req, res) => {
    const { id } = req.params;

    try {
      const realisasi = await realisasiPJPL.findByPk(id);
      if (!realisasi) {
        return res
          .status(404)
          .json({ error: "Realisasi PJPL tidak ditemukan" });
      }

      await realisasi.destroy();

      return res
        .status(200)
        .json({ message: "Realisasi PJPL berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== HASIL KERJA PJPL CONTROLLERS ==========
  postHasilKerjaPJPL: async (req, res) => {
    const { hasil, nilai, realisasiPJPLId, status } = req.body;

    try {
      const result = await hasilKerjaPJPL.create({
        hasil,
        nilai,
        realisasiPJPLId,
        status: status || "diajukan",
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getHasilKerjaPJPL: async (req, res) => {
    const { realisasiPJPLId } = req.query;

    try {
      const where = {};
      if (realisasiPJPLId) {
        where.realisasiPJPLId = realisasiPJPLId;
      }

      const result = await hasilKerjaPJPL.findAll({
        where,
        include: [
          {
            model: realisasiPJPL,
            as: "realisasiPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir", "status"],
            include: [
              {
                model: kinerjaPJPL,
                attributes: ["id", "indikator", "target", "status"],
                include: [
                  {
                    model: kontrakPJPL,
                    attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                    include: [
                      {
                        model: pegawai,
                        attributes: ["id", "nama", "nip", "jabatan"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getHasilKerjaPJPLById: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await hasilKerjaPJPL.findOne({
        where: { id },
        include: [
          {
            model: realisasiPJPL,
            as: "realisasiPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir", "status"],
            include: [
              {
                model: kinerjaPJPL,
                attributes: ["id", "indikator", "target", "status"],
                include: [
                  {
                    model: kontrakPJPL,
                    attributes: ["id", "tanggalAwal", "tanggalAkhir"],
                    include: [
                      {
                        model: pegawai,
                        attributes: ["id", "nama", "nip", "jabatan"],
                      },
                    ],
                  },
                  {
                    model: indikatorPejabat,
                    attributes: ["id", "indikator"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!result) {
        return res
          .status(404)
          .json({ error: "Hasil kerja PJPL tidak ditemukan" });
      }

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  updateHasilKerjaPJPL: async (req, res) => {
    const { id } = req.params;
    const { hasil, nilai, status } = req.body;

    try {
      const hasilKerja = await hasilKerjaPJPL.findByPk(id);
      if (!hasilKerja) {
        return res
          .status(404)
          .json({ error: "Hasil kerja PJPL tidak ditemukan" });
      }

      const updateData = {};
      if (hasil !== undefined) updateData.hasil = hasil;
      if (nilai !== undefined) updateData.nilai = nilai;
      if (status !== undefined) updateData.status = status;

      await hasilKerja.update(updateData);

      const result = await hasilKerjaPJPL.findByPk(id, {
        include: [
          {
            model: realisasiPJPL,
            as: "realisasiPJPL",
            attributes: ["id", "tanggalAwal", "tanggalAkhir", "status"],
            include: [
              {
                model: kinerjaPJPL,
                attributes: ["id", "indikator", "target"],
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

  deleteHasilKerjaPJPL: async (req, res) => {
    const { id } = req.params;

    try {
      const hasilKerja = await hasilKerjaPJPL.findByPk(id);
      if (!hasilKerja) {
        return res
          .status(404)
          .json({ error: "Hasil kerja PJPL tidak ditemukan" });
      }

      await hasilKerja.destroy();

      return res
        .status(200)
        .json({ message: "Hasil kerja PJPL berhasil dihapus" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
