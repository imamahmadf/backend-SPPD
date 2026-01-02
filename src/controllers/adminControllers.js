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
  suratKeluar,
  sequelize,
  daftarNomorSurat,
  sumberDana,
  bendahara,
  jenisSurat,
  tipePerjalanan,
  indukUnitKerja,
  ttdSuratTugas,
  ttdNotaDinas,
  PPTK,
  KPA,
  pelayananKesehatan,
  templateKeuangan,
  anggaran,
  fotoPerjalanan,
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
          "isNotaDinas",
          "pic",
          "dasar",
          "undangan",
          "jenisId",
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
                required: true,
                where: {
                  id: {
                    [Op.ne]: 1, // tidak sama dengan 1
                  },
                },
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
            model: bendahara,
            attributes: ["id", "jabatan"],
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_bendahara",
              },
              {
                model: sumberDana,
                attributes: [
                  "id",
                  "sumber",
                  "untukPembayaran",
                  "kalimat1",
                  "kalimat2",
                ],
              },
            ],
          },

          { model: pelayananKesehatan },
          {
            model: PPTK,
            attributes: ["id", "jabatan"],
            paranoid: false, // ✅ tambahkan ini
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_PPTK",
              },
            ],
          },
          {
            model: KPA,
            attributes: ["id", "jabatan"],
            paranoid: false, // ✅ tambahkan ini
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
                as: "pegawai_KPA",
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
                  "indukUnitKerjaId",
                ],
              },
            ],
          },
          {
            model: fotoPerjalanan,
            attributes: ["id", "foto", "perjalananId", "tanggal"],
            required: false, // Left join agar perjalanan tetap muncul meski tidak ada foto
          },
          {
            model: jenisPerjalanan,
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
            include: [
              { model: anggaran, include: [{ model: tipePerjalanan }] },
            ],
          },
          // {
          //   model: ttdSuratTugas,
          //   attributes: ["nama", "id", "nip", "jabatan"],
          // },
        ],
      });

      const template = await templateKeuangan.findAll({
        attributes: ["id", "nama"],
      });
      return res.status(200).json({ result, template });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getSuratKeluar: async (req, res) => {
    const indukUnitKerjaId = req.query.indukUnitKerjaId;
    console.log(indukUnitKerjaId, "INDUK UNIT KERJA");
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 15;
    const tanggalBerangkat = req.query.tanggalBerangkat;
    const tanggalPulang = req.query.tanggalPulang;
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    try {
      const result = await suratKeluar.findAll({
        offset,
        limit,
        order: [["createdAt", time]],
        attributes: [
          "id",
          "nomor",
          "perihal",
          "tujuan",
          "tanggalSurat",
          "createdAt",
          [sequelize.fn("COUNT", sequelize.col("suratKeluar.id")), "count"],
        ],
        where: { indukUnitKerjaId },
        include: [
          {
            model: perjalanan,
            attributes: ["id", "isNotaDinas", "tanggalPengajuan"],
          },
        ],
        group: ["suratKeluar.id"],
      });

      const totalRows = await suratKeluar.count({
        where: { indukUnitKerjaId },
      });

      const resultUnitKerja = await daftarUnitKerja.findAll({
        where: { indukUnitKerjaId },
        attributes: ["id", "kode"],
      });
      const totalPage = Math.ceil(totalRows / limit);
      return res
        .status(200)
        .json({ result, page, limit, totalRows, totalPage, resultUnitKerja });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  postSuratKeluar: async (req, res) => {
    const {
      unitKerja,
      dataKodeKlasifikasi,
      tujuan,
      perihal,
      tanggalSurat,
      indukUnitKerja,
    } = req.body;
    console.log(req.body);

    const transaction = await sequelize.transaction();
    try {
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
      const dbNoSurat = await daftarNomorSurat.findOne({
        where: { indukUnitKerjaId: indukUnitKerja.id },
        include: [{ model: jenisSurat, as: "jenisSurat", where: { id: 2 } }],
        transaction,
      });
      const nomorLoket = parseInt(dbNoSurat.nomorLoket) + 1;
      const kode =
        indukUnitKerja.kodeInduk === unitKerja.kode
          ? indukUnitKerja.kodeInduk
          : indukUnitKerja.kodeInduk + "/" + unitKerja.kode;
      console.log("NOMOR LOKET", nomorLoket);
      const nomor = dbNoSurat.jenisSurat.nomorSurat
        .replace("NOMOR", nomorLoket.toString())
        .replace("KLASIFIKASI", dataKodeKlasifikasi)
        .replace("KODE", kode)
        .replace("BULAN", getRomanMonth(new Date(tanggalSurat)));
      await daftarNomorSurat.update(
        { nomorLoket }, // Hanya objek yang berisi field yang ingin diperbarui
        { where: { id: dbNoSurat.id }, transaction }
      );

      const result = await suratKeluar.create(
        {
          nomor,
          indukUnitKerjaId: indukUnitKerja.id,
          tujuan,
          perihal,
          tanggalSurat,
        },
        transaction
      );
      await transaction.commit();
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error("Error in postSuratKeluar:", err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getIndukUnitKerja: async (req, res) => {
    try {
      const result = await indukUnitKerja.findAll({
        attributes: ["id", "kodeInduk", "indukUnitKerja"],
        include: [
          { model: daftarUnitKerja, attributes: ["id", "kode", "asal"] },
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
  getSumberDana: async (req, res) => {
    try {
      const result = await sumberDana.findAll({});

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getUnitKerja: async (req, res) => {
    try {
      const result = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
      });

      return res.status(200).json({ result });
    } catch (err) {
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  getAllPerjalananKeuangan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 15;
    const unitKerjaId = parseInt(req.query.unitKerjaId) || null;
    const sumberDanaId = parseInt(req.query.sumberDanaId) || null;
    const pegawaiId = parseInt(req.query.pegawaiId);
    const time = req.query.time?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const offset = limit * page;
    console.log(unitKerjaId, "INI UNIT KERJA");
    const whereConditionPegawai = {};
    const whereCondition = {};
    const whereSumberDana = {};
    if (unitKerjaId) {
      whereCondition.unitKerjaId = unitKerjaId;
    }
    if (pegawaiId) {
      whereConditionPegawai.pegawaiId = pegawaiId;
    }
    if (sumberDanaId) {
      whereSumberDana.sumberDanaId = sumberDanaId;
    }

    try {
      const result = await perjalanan.findAll({
        offset,

        limit,
        order: [
          [{ model: tempat }, "tanggalBerangkat", "DESC"],
          [{ model: personil }, "id", "ASC"],
        ],
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
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId"],
            where: whereCondition, // ✅ Filter data berdasarkan unit kerja yang diminta
            required: true, // ✅ Pastikan hanya ambil yang punya relasi
          },
          {
            model: personil,
            where: whereConditionPegawai,
            include: [
              {
                model: pegawai,
              },
              {
                model: status,
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
                attributes: ["id", "nama", "durasi"],
              },
            ],
          },
          {
            model: suratKeluar,
            attributes: ["id", "nomor"],
          },
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
          },
          {
            model: ttdSuratTugas,
            attributes: ["id", "jabatan", "indukUnitKerjaId"],
            paranoid: false, // ✅ tambahkan ini
            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai",
              },
              {
                model: indukUnitKerja,
                attributes: ["id", "kodeInduk"],
                as: "indukUnitKerja_ttdSuratTugas",
                include: [
                  {
                    model: daftarUnitKerja,
                    attributes: ["id", "kode"],
                  },
                ],
              },
            ],
          },

          {
            model: ttdNotaDinas,
            attributes: ["id", "unitKerjaId", "pegawaiId"],
            paranoid: false, // ✅ tambahkan ini

            include: [
              {
                model: pegawai,
                attributes: ["id", "nama", "nip", "jabatan"],
                as: "pegawai_notaDinas",
              },
            ],
          },
          {
            model: jenisPerjalanan,
            attributes: ["id", "jenis", "kodeRekening"],
            include: [{ model: tipePerjalanan, attributes: ["id", "tipe"] }],
          },
          {
            model: bendahara,
            attributes: ["id"],
            where: whereSumberDana,
          },
        ],
      });

      const totalRows = await perjalanan.count({
        include: [
          {
            model: ttdNotaDinas,
            where: whereCondition, // ✅ Filter data berdasarkan unit kerja yang diminta
          },
          {
            model: personil,
            where: whereConditionPegawai,
          },
          {
            model: bendahara,

            where: whereSumberDana,
          },
        ],
      });

      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  deleteSuratKeluar: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDDD");
    try {
      const result = await suratKeluar.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  searchUnitKerja: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await daftarUnitKerja.findAll({
        where: {
          unitKerja: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: ["id", "unitKerja"],
        limit: 10,
        order: [["unitKerja", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  getDashboardKeuangan: async (req, res) => {
    try {
      const result = await daftarUnitKerja.findAll({
        attributes: ["id", "unitKerja"],
        include: [
          {
            model: daftarSubKegiatan,
            attributes: ["id", "kodeRekening", "subKegiatan"],
            include: [
              {
                model: perjalanan,
                attributes: ["id"],
                include: [
                  {
                    model: personil,
                    attributes: ["id", "statusId"],
                    include: [{ model: rincianBPD, attributes: ["nilai"] }],
                  },
                  {
                    model: jenisPerjalanan,
                    attributes: ["id", "tipePerjalananId"],
                    include: [
                      { model: tipePerjalanan, attributes: ["id", "tipe"] },
                    ],
                  },
                  {
                    model: tempat,
                    attributes: [
                      "id",
                      "tempat",
                      "tanggalBerangkat",
                      "tanggalPulang",
                    ],
                  },
                ],
              },
              {
                model: anggaran,
                attributes: ["id", "nilai", "tahun", "tipePerjalananId"],
                include: [
                  { model: tipePerjalanan, attributes: ["id", "tipe"] },
                ],
              },
            ],
          },
        ],
      });

      // Menghitung total personil per sub kegiatan dan per unit kerja berdasarkan statusId
      const resultWithTotal = result.map((unitKerja) => {
        // Counter untuk unit kerja
        const uniquePersonilUnitKerja = new Set();
        const statusCountUnitKerja = {
          1: new Set(),
          2: new Set(),
          3: new Set(),
          4: new Set(),
        };

        const subKegiatans =
          unitKerja.daftarSubKegiatans?.map((subKegiatan) => {
            // Counter untuk sub kegiatan
            const uniquePersonilSubKegiatan = new Set();
            const statusCountSubKegiatan = {
              1: new Set(),
              2: new Set(),
              3: new Set(),
              4: new Set(),
            };

            // Mengelompokkan anggaran berdasarkan tahun dan tipePerjalananId
            const groupedAnggaran = {};
            subKegiatan.anggarans?.forEach((a) => {
              const tahun = new Date(a.tahun).getFullYear();
              const key = `${tahun}-${a.tipePerjalananId}`;
              groupedAnggaran[key] = {
                tahun,
                tipePerjalananId: a.tipePerjalananId,
                tipePerjalanan: a.tipePerjalanan?.tipe || null,
                anggaran: a.nilai,
                totalRealisasi: 0,
                id: a.id,
              };
            });

            // Mengumpulkan tempat tujuan dari semua perjalanan
            const tempatTujuan = new Set();
            const tipePerjalananList = new Set();

            const perjalanans =
              subKegiatan.perjalanans?.map((perjalanan) => {
                const totalPersonilPerjalanan =
                  perjalanan.personils?.length || 0;

                // Counter untuk perjalanan berdasarkan statusId
                const statusCountPerjalanan = { 1: 0, 2: 0, 3: 0, 4: 0 };

                // Mengumpulkan tempat tujuan
                perjalanan.tempats?.forEach((tempat) => {
                  if (tempat.tempat) {
                    tempatTujuan.add(tempat.tempat);
                  }
                });

                // Mengumpulkan tipe perjalanan
                const tipeId = perjalanan.jenisPerjalanan?.tipePerjalananId;
                const tipeNama =
                  perjalanan.jenisPerjalanan?.tipePerjalanan?.tipe;
                if (tipeId && tipeNama) {
                  tipePerjalananList.add(tipeNama);
                }

                // Menghitung personil unik per perjalanan berdasarkan statusId
                perjalanan.personils?.forEach((personil) => {
                  if (personil.id) {
                    uniquePersonilSubKegiatan.add(personil.id);
                    uniquePersonilUnitKerja.add(personil.id);

                    // Menghitung berdasarkan statusId
                    const statusId = personil.statusId;
                    if (
                      statusId === 1 ||
                      statusId === 2 ||
                      statusId === 3 ||
                      statusId === 4
                    ) {
                      statusCountPerjalanan[statusId]++;
                      statusCountSubKegiatan[statusId].add(personil.id);
                      statusCountUnitKerja[statusId].add(personil.id);
                    }

                    // Menghitung realisasi anggaran
                    if (statusId !== null && tipeId) {
                      const tanggalBerangkat =
                        perjalanan.tempats?.[0]?.tanggalBerangkat;
                      const tahunBerangkat = tanggalBerangkat
                        ? new Date(tanggalBerangkat).getFullYear()
                        : null;

                      if (tahunBerangkat) {
                        const key = `${tahunBerangkat}-${tipeId}`;
                        if (groupedAnggaran[key]) {
                          personil.rincianBPDs?.forEach((rincian) => {
                            groupedAnggaran[key].totalRealisasi +=
                              rincian.nilai || 0;
                          });
                        }
                      }
                    }
                  }
                });

                return {
                  ...perjalanan.toJSON(),
                  totalPersonilPerjalanan,
                  totalPersonilStatus1: statusCountPerjalanan[1],
                  totalPersonilStatus2: statusCountPerjalanan[2],
                  totalPersonilStatus3: statusCountPerjalanan[3],
                  totalPersonilStatus4: statusCountPerjalanan[4],
                };
              }) || [];

            return {
              ...subKegiatan.toJSON(),
              perjalanans,
              totalPersonilSubKegiatan: uniquePersonilSubKegiatan.size,
              totalPersonilStatus1: statusCountSubKegiatan[1].size,
              totalPersonilStatus2: statusCountSubKegiatan[2].size,
              totalPersonilStatus3: statusCountSubKegiatan[3].size,
              totalPersonilStatus4: statusCountSubKegiatan[4].size,
              tempatTujuan: Array.from(tempatTujuan),
              tipePerjalanan: Array.from(tipePerjalananList),
              anggaranByTipe: Object.values(groupedAnggaran),
            };
          }) || [];

        return {
          ...unitKerja.toJSON(),
          daftarSubKegiatans: subKegiatans,
          totalPersonilUnitKerja: uniquePersonilUnitKerja.size,
          totalPersonilStatus1: statusCountUnitKerja[1].size,
          totalPersonilStatus2: statusCountUnitKerja[2].size,
          totalPersonilStatus3: statusCountUnitKerja[3].size,
          totalPersonilStatus4: statusCountUnitKerja[4].size,
        };
      });

      res.status(200).json({ result: resultWithTotal });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
};

//cek aja
