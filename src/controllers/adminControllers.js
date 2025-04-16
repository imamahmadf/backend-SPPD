const {
  pegawai,

  daftarGolongan,
  daftarPangkat,
  perjalanan,
  personil,
  tempat,
  daftarUnitKerja,
  daftarSubKegiatan,
  daftarKegiatan,
  rill,
  rincianBPD,
  jenisPerjalanan,
  dalamKota,
  jenisRincianBPD,
  status,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  detailPerjalanan: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await perjalanan.findOne({
        where: { id },
        attributes: [
          "id",
          "untuk",
          "asal",
          "noNotaDinas",
          "tanggalPengajuan",
          "noSuratTugas",
        ],
        include: [
          {
            model: personil,
            include: [
              {
                model: pegawai,
                include: [
                  { model: daftarPangkat, as: "daftarPangkat" },
                  { model: daftarGolongan, as: "daftarGolongan" },
                ],
              },
              {
                model: status,
                attributes: ["id", "statusKuitansi"],
              },
              {
                model: rincianBPD,
                attributes: [
                  "id",
                  "item",
                  "nilai",
                  "qty",
                  "jenisId",
                  "satuan",
                  "bukti",
                ],
                include: [
                  { model: jenisRincianBPD, attributes: ["jenis"] },
                  { model: rill },
                ],
              },
            ],
          },
          {
            model: tempat,
            attributes: ["tempat", "tanggalBerangkat", "tanggalPulang"],
            include: [
              {
                model: dalamKota,
                as: "dalamKota",
                attributes: [
                  "id",
                  "uangTransport",
                  "nama",
                  "durasi",
                  "unitKerjaId",
                ],
              },
            ],
          },
          {
            model: jenisPerjalanan,
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
            include: [
              {
                model: daftarKegiatan,
                attributes: ["id", "kodeRekening", "kegiatan"],
                as: "kegiatan",
              },
            ],
          },
          // {
          //   model: ttdSuratTugas,
          //   attributes: ["nama", "id", "nip", "jabatan"],
          // },
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
