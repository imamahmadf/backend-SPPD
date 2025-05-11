const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  perjalanan,
  personil,
  rincianBPD,
  jenisPerjalanan,
  rill,
  tempat,
  dalamKota,
} = require("../models");

const { Op, where } = require("sequelize");

module.exports = {
  getPegawai: async (req, res) => {
    try {
      const result = await pegawai.findAll({
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
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
  getDaftarPegawai: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search_query || "";
    const alfabet = req.query.alfabet || "ASC";
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;

    const whereCondition = {
      nama: { [Op.like]: "%" + search + "%" },
    };
    try {
      const result = await pegawai.findAll({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
          { model: daftarUnitKerja, as: "daftarUnitKerja", attributes: ["id"] },
        ],
      });
      const totalRows = await pegawai.count({
        where: whereCondition,
        offset,
        limit,
        order: [
          // ["updatedAt", `${time}`],
          ["nama", `${alfabet}`],
        ],
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getOnePegawai: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pegawai.findOne({
        where: { id },
        attributes: ["id", "nama", "nip", "jabatan"],
        include: [
          {
            model: daftarTingkatan,
            as: "daftarTingkatan",
          },
          { model: daftarGolongan, as: "daftarGolongan" },
          { model: daftarPangkat, as: "daftarPangkat" },
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
  getSeedPegawai: async (req, res) => {
    try {
      const resultGolongan = await daftarGolongan.findAll({});
      const resultPangkat = await daftarPangkat.findAll({});
      const resultTingkatan = await daftarTingkatan.findAll({});

      return res
        .status(200)
        .json({ resultGolongan, resultPangkat, resultTingkatan });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  editPegawai: async (req, res) => {
    const { id, dataPegawai } = req.body;
    console.log(req.body);
    try {
      const result = await pegawai.update(
        {
          nama: dataPegawai.nama,
          jabatan: dataPegawai.jabatan,
          nip: dataPegawai.nip,
          golonganId: dataPegawai.daftarGolongan.id,
          tingkatanId: dataPegawai.daftarTingkatan.id,
          pangkatId: dataPegawai.daftarPangkat.id,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  addPegawai: async (req, res) => {
    const { nama, nip, jabatan, pangkatId, golonganId, tingkatanId } = req.body;
    console.log(req.body);
    try {
      const result = await pegawai.create({
        nama,
        jabatan,
        nip,
        golonganId,
        tingkatanId,
        pangkatId,
      });

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getDetailPegawai: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log("TES FRONT END11");
    try {
      const result = await pegawai.findAll({
        include: [
          {
            offset,
            limit,
            model: personil,
            attributes: ["id", "nomorSPD"],
            include: [
              {
                model: perjalanan,
                attributes: ["id"],

                include: [
                  {
                    model: jenisPerjalanan,
                    attributes: ["id", "jenis"],
                  },
                  {
                    model: tempat,
                    attributes: [
                      "id",
                      "tempat",
                      "tanggalBerangkat",
                      "tanggalPulang",
                    ],
                    include: [
                      {
                        model: dalamKota,
                        as: "dalamKota",
                        attributes: ["id", "nama"],
                      },
                    ],
                  },
                ],
              },
              { model: rincianBPD },
            ],
          },
        ],
        where: { id },
      });

      const totalRows = await pegawai.count({
        include: [{ model: personil }],
        where: { id },
      });
      const totalPage = Math.ceil(totalRows / limit);

      // Menyusun data sesuai permintaan
      const response = result.map((pegawai) => ({
        nama: pegawai.nama,
        nip: pegawai.nip,
        jabatan: pegawai.jabatan,
        personils: pegawai.personils.map((personil) => ({
          nomorSPD: personil.nomorSPD,
          tujuan:
            personil.perjalanan.jenisPerjalanan.jenis ===
            "Perjalanan Dinas Biasa"
              ? personil.perjalanan.tempats.map((tempat) => tempat.tempat)
              : personil.perjalanan.tempats.map(
                  (tempat) => tempat.dalamKota.nama
                ),
          totaluang: personil.rincianBPDs
            ? personil.rincianBPDs.reduce(
                (total, rincian) => total + rincian.nilai,
                0
              )
            : 0,
        })),
      }));

      return res
        .status(200)
        .json({ result: response, page, limit, totalRows, totalPage });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
};
