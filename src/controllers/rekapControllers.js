const {
  daftarUnitKerja,
  daftarSubKegiatan,
  personil,
  ttdNotaDinas,
  pegawai,
  perjalanan,
  tempat,
  dalamKota,
  jenisPerjalanan,
  tipePerjalanan,
  sequelize,
  daftarNomorSurat,
  jenisSurat,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getPerjalanan: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;
    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }
    try {
      const result = await perjalanan.findAll({
        limit,
        offset,
        subQuery: false,
        where: whereConditionSubKegiatan,
        include: [
          {
            model: personil,
            attributes: ["id", "nomorSPD"],
            include: [{ model: pegawai, attributes: ["nama", "nip"] }],
            where: whereConditionPegawaiId,
          },
          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId"],
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat, // <- Filter terapkan di sini
            attributes: ["id", "tanggalBerangkat", "tanggalPulang", "tempat"],
            include: [
              { model: dalamKota, attributes: ["id", "nama"], as: "dalamKota" },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "subKegiatan"],
          },
        ],
        attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      const totalRows = await perjalanan.count({
        where: whereConditionSubKegiatan,
        include: [
          {
            model: ttdNotaDinas,
            where: whereCondition,
          },
          {
            model: tempat,
            where: whereConditionTempat,
          },
        ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getSPPD: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.query);
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const unitKerjaId = parseInt(req.query.unitKerjaId);
    const subKegiatanId = parseInt(req.query.subKegiatanId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const pegawaiId = parseInt(req.query.pegawaiId);
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const offset = limit * page;
    const whereCondition = {};
    const whereConditionSubKegiatan = {};
    const whereConditionPegawaiId = {};

    if (pegawaiId) {
      whereConditionPegawaiId.pegawaiId = pegawaiId;
    }

    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }

    const whereConditionTempat = {};

    if (tanggalBerangkat) {
      whereConditionTempat.tanggalBerangkat = {
        [Op.gte]: new Date(tanggalBerangkat),
      };
    }

    if (tanggalPulang) {
      whereConditionTempat.tanggalPulang = {
        [Op.lte]: new Date(tanggalPulang),
      };
    }

    if (subKegiatanId) {
      whereConditionSubKegiatan.subKegiatanId = subKegiatanId;
    }
    try {
      const result = await personil.findAll({
        limit,
        offset,
        subQuery: false,

        include: [
          {
            model: perjalanan,
            attributes: ["id", "noSuratTugas"],
            include: [
              {
                model: ttdNotaDinas,
                attributes: ["id", "unitKerjaId"],
                where: whereCondition,
              },
              {
                model: tempat,
                where: whereConditionTempat, // <- Filter terapkan di sini
                attributes: [
                  "id",
                  "tanggalBerangkat",
                  "tanggalPulang",
                  "tempat",
                ],
                include: [
                  {
                    model: dalamKota,
                    attributes: ["id", "nama"],
                    as: "dalamKota",
                  },
                ],
              },
              {
                model: jenisPerjalanan,
                attributes: ["id"],
                include: [
                  { model: tipePerjalanan, attributes: ["id", "tipe"] },
                ],
              },
              {
                model: daftarSubKegiatan,
                attributes: ["id", "subKegiatan"],
              },
            ],
            where: whereConditionPegawaiId,
          },
          { model: pegawai, attributes: ["nama", "nip"] },
        ],
        // attributes: ["id", "noNotaDinas", "noSuratTugas"],
      });

      const totalRows = await personil.count({
        // include: [
        //   {
        //     model: ttdNotaDinas,
        //     where: whereCondition,
        //   },
        //   {
        //     model: tempat,
        //     where: whereConditionTempat,
        //   },
        // ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  postSPPD: async (req, res) => {
    // const indukUnitKerjaId = req.query.id;
    console.log(req.body, "INI DARI FE");
    const transaction = await sequelize.transaction();
    const getRomanMonth = (date) => {
      const months = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ];
      return months[date.getMonth()];
    };
    try {
      const {
        jenisPerjalananId,
        tipePerjalananId,
        tempats,
        unitKerjaId,
        indukUnitKerjaFE,
        untuk,
        pegawaiIds,
        unitKerjaFE,
      } = req.body;

      const dbPerjalanan = await perjalanan.create(
        {
          untuk,
        },
        { transaction }
      );

      const dataPersonil = pegawaiIds.map((item) => ({
        perjalananId: dbPerjalanan.id,
        pegawaiId: parseInt(item),
        status: 1,
      }));
      await personil.bulkCreate(dataPersonil, { transaction });
      let dataKota = []; // Inisialisasi dataKota sebagai array kosong
      let dataDalamKota = [];

      if (tipePerjalananId === 2) {
        // Buat data kota tujuan
        dataKota = tempats.map((item) => ({
          perjalananId: dbPerjalanan.id,
          tempat: item.tempat,
          tanggalBerangkat: item.tanggalBerangkat,
          tanggalPulang: item.tanggalPulang,
          dalamKotaId: 1,
        }));

        await tempat.bulkCreate(dataKota, { transaction });
      } else if (tipePerjalananId === 1) {
        dataDalamKota = tempats.map((item) =>
          // console.log(item),
          ({
            perjalananId: dbPerjalanan.id,
            tempat: "dalam kota",
            dalamKotaId: item.dalamKotaId,
            tanggalBerangkat: item.tanggalBerangkat,
            tanggalPulang: item.tanggalPulang,
          })
        );
        await tempat.bulkCreate(dataDalamKota, { transaction });
      }

      const dbNoSPD = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: indukUnitKerjaFE.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 3 } }],
      });

      let nomorAwalSPD = parseInt(dbNoSPD.nomorLoket);
      let noSpd;
      const codeNoSPD =
        unitKerjaFE.kode === indukUnitKerjaFE.kode
          ? indukUnitKerjaFE.kode
          : indukUnitKerjaFE.kode + "/" + unitKerjaFE.kode;

      noSpd = pegawaiIds.map((item, index) => ({
        nomorSPD: dbNoSPD.jenisSurat.nomorSurat
          .replace(
            "NOMOR",
            (indukUnitKerjaFE.id == 1
              ? "         "
              : nomorAwalSPD + index + 1
            ).toString()
          )
          .replace("KODE", codeNoSPD)
          .replace(
            "BULAN",
            getRomanMonth(new Date(tempats[0].tanggalBerangkat))
          ),
      }));

      await daftarNomorSurat.update(
        { nomorLoket: nomorAwalSPD + noSpd.length }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSPD.id }, transaction }
      );

      for (const [index, pegawaiId] of pegawaiIds.entries()) {
        await personil.update(
          {
            nomorSPD: noSpd[index].nomorSPD,
            statusId: 1,
          },
          {
            where: {
              perjalananId: dbPerjalanan.id,
              pegawaiId: parseInt(pegawaiId),
            },
            transaction,
          }
        );
      }
      await transaction.commit();
      return res.status(201).json({
        message: "SPPD berhasil dibuat",
        perjalananId: dbPerjalanan.id,
        nomorSPD: noSpd.map((n) => n.nomorSPD),
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
