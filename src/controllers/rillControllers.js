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
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postRill: async (req, res) => {
    console.log(req.body);
    const { item, nilai, rincianBPDId, personilId, status, nilaiBPD } =
      req.body;
    const transaction = await sequelize.transaction();
    try {
      if (!status) {
        var rillBPD = await rincianBPD.create(
          {
            personilId,
            item: "Pengeluaran rill",
            nilai,
            jenisId: 4,
            qty: 1,
            satuan: "-",
          },
          { transaction }
        );
      }
      const rillTransport = await rill.create(
        {
          rincianBPDId: !status ? rillBPD.id : rincianBPDId,
          item,
          nilai,
        },
        { transaction }
      );

      const updateBPD = await rincianBPD.update(
        { nilai: parseInt(nilai) + nilaiBPD },
        { where: { id: !status ? rillBPD.id : rincianBPDId }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({
        message: "berhasil tambah data",
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      return res.status(500).json({
        message: err,
      });
    }
  },
  tes: async (req, res) => {
    try {
      const resultUser = await user.findOne({
        where: { email: "tes@mail.com" },
        include: [
          { model: userRole, include: [{ model: role, attributes: ["nama"] }] },
          {
            model: profile,
            attributes: ["id", "nama", "profilePic"],
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id"],
                as: "unitKerja-profile",
              },
            ],
          },
        ],
      });
      return res.status(200).json({ resultUser });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
