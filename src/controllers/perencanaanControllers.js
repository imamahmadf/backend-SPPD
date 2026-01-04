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
  pegawai,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getAllProgram: async (req, res) => {
    try {
      const { search, searchType, unitKerja } = req.query;
      const searchQuery = search?.trim() || "";
      const searchTypeValue = searchType || "semua";
      const unitKerjaFilter =
        unitKerja && unitKerja !== "semua" ? unitKerja.trim() : null;

      // Build where condition untuk program
      const programWhere = {};
      if (
        searchQuery &&
        (searchTypeValue === "semua" || searchTypeValue === "program")
      ) {
        programWhere[Op.or] = [
          { nama: { [Op.like]: `%${searchQuery}%` } },
          { kode: { [Op.like]: `%${searchQuery}%` } },
        ];
      }

      // Build include untuk kegiatan
      const kegiatanInclude = {
        model: kegiatan,
        paranoid: true,
        required: false,
      };

      // Build where condition untuk kegiatan
      if (
        searchQuery &&
        (searchTypeValue === "semua" || searchTypeValue === "kegiatan")
      ) {
        kegiatanInclude.where = {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchQuery}%` } },
            { kode: { [Op.like]: `%${searchQuery}%` } },
          ],
        };
        kegiatanInclude.required = false;
      }

      // Build include untuk subKegPer
      const subKegPerInclude = {
        model: subKegPer,
        paranoid: true,
        required: false,
      };

      // Build where condition untuk subKegPer
      if (
        searchQuery &&
        (searchTypeValue === "semua" || searchTypeValue === "subKegiatan")
      ) {
        subKegPerInclude.where = {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchQuery}%` } },
            { kode: { [Op.like]: `%${searchQuery}%` } },
          ],
        };
        subKegPerInclude.required = false;
      }

      // Build include untuk daftarUnitKerja
      const unitKerjaInclude = {
        model: daftarUnitKerja,
        attributes: ["id", "unitKerja"],
        required: false,
      };

      // Filter berdasarkan unit kerja
      if (unitKerjaFilter) {
        unitKerjaInclude.where = {
          unitKerja: unitKerjaFilter,
        };
        unitKerjaInclude.required = true;
        subKegPerInclude.required = true;
        kegiatanInclude.required = true;
      }

      subKegPerInclude.include = [unitKerjaInclude];
      kegiatanInclude.include = [subKegPerInclude];

      // Jika ada search di kegiatan atau subKegiatan, kita perlu memastikan program tetap ditampilkan
      // tapi hanya jika memiliki kegiatan/subKegiatan yang match
      if (
        searchQuery &&
        (searchTypeValue === "kegiatan" || searchTypeValue === "subKegiatan")
      ) {
        kegiatanInclude.required = true;
        if (searchTypeValue === "subKegiatan") {
          subKegPerInclude.required = true;
        }
      }

      const includeArray = [kegiatanInclude];

      // Jika hanya search di program, tidak perlu required
      if (searchQuery && searchTypeValue === "program" && !unitKerjaFilter) {
        includeArray[0].required = false;
      }

      const result = await program.findAll({
        where: Object.keys(programWhere).length > 0 ? programWhere : undefined,
        paranoid: true,
        include: includeArray,
      });

      // Filter hasil di JavaScript untuk menghapus kegiatan/subKegiatan yang tidak match
      // karena Sequelize akan tetap mengembalikan parent meskipun child tidak match jika required: false
      const filteredResult = result
        .map((prog) => {
          const progData = prog.toJSON();
          if (progData.kegiatans) {
            progData.kegiatans = progData.kegiatans
              .map((keg) => {
                if (keg.subKegPers) {
                  // Filter subKegiatan berdasarkan unit kerja dan search
                  keg.subKegPers = keg.subKegPers.filter((sub) => {
                    // Filter unit kerja
                    if (
                      unitKerjaFilter &&
                      (!sub.daftarUnitKerja ||
                        sub.daftarUnitKerja.unitKerja !== unitKerjaFilter)
                    ) {
                      return false;
                    }
                    // Filter search di subKegiatan (jika searchType adalah subKegiatan atau semua)
                    if (
                      searchQuery &&
                      (searchTypeValue === "subKegiatan" ||
                        searchTypeValue === "semua")
                    ) {
                      const matches =
                        sub.nama
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        sub.kode
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase());
                      if (!matches) return false;
                    }
                    return true;
                  });
                  // Hapus subKegiatan yang tidak memiliki unit kerja jika filter unitKerja aktif
                  if (unitKerjaFilter) {
                    keg.subKegPers = keg.subKegPers.filter(
                      (sub) => sub.daftarUnitKerja
                    );
                  }
                }
                // Filter kegiatan berdasarkan search (jika searchType adalah kegiatan atau semua)
                if (
                  searchQuery &&
                  (searchTypeValue === "kegiatan" ||
                    searchTypeValue === "semua")
                ) {
                  const matches =
                    keg.nama
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    keg.kode?.toLowerCase().includes(searchQuery.toLowerCase());
                  // Jika searchType adalah "semua", tetap tampilkan kegiatan jika ada subKegiatan yang match
                  if (!matches && searchTypeValue === "semua") {
                    // Cek apakah ada subKegiatan yang match
                    if (keg.subKegPers && keg.subKegPers.length > 0) {
                      // Ada subKegiatan yang match, jadi tetap tampilkan
                    } else {
                      return null;
                    }
                  } else if (!matches) {
                    return null;
                  }
                }
                // Hapus kegiatan yang tidak memiliki subKegiatan jika filter aktif
                if (
                  unitKerjaFilter &&
                  (!keg.subKegPers || keg.subKegPers.length === 0)
                ) {
                  return null;
                }
                return keg;
              })
              .filter((keg) => keg !== null);
          }
          // Hapus program yang tidak memiliki kegiatan jika filter aktif
          if (
            unitKerjaFilter &&
            (!progData.kegiatans || progData.kegiatans.length === 0)
          ) {
            return null;
          }
          // Jika search di kegiatan atau subKegiatan, pastikan ada kegiatan/subKegiatan yang match
          if (
            searchQuery &&
            (searchTypeValue === "kegiatan" ||
              searchTypeValue === "subKegiatan")
          ) {
            if (!progData.kegiatans || progData.kegiatans.length === 0) {
              return null;
            }
          }
          // Jika searchType adalah "semua", pastikan program hanya ditampilkan jika ada match di salah satu level
          // (program level sudah di-filter di where condition, jadi jika sampai sini berarti program match)
          // Tapi perlu pastikan ada kegiatan atau subKegiatan yang match jika ada search query
          if (searchQuery && searchTypeValue === "semua") {
            // Program sudah match (karena ada di result), tapi perlu pastikan ada kegiatan atau subKegiatan yang match
            if (!progData.kegiatans || progData.kegiatans.length === 0) {
              // Tidak ada kegiatan, tapi program sudah match, jadi tetap tampilkan
              return progData;
            }
          }
          return progData;
        })
        .filter((prog) => prog !== null);

      return res.status(200).json({ result: filteredResult });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getUnitKerja: async (req, res) => {
    try {
      // Ambil semua unit kerja yang ada di subKegPer
      const result = await subKegPer.findAll({
        paranoid: true,
        attributes: ["unitKerjaId"],
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
            required: true,
          },
        ],
      });

      // Extract unique unit kerja menggunakan Map
      const unitKerjaMap = new Map();

      result.forEach((subKeg) => {
        const unitKerjaData = subKeg.toJSON().daftarUnitKerja;
        if (unitKerjaData && !unitKerjaMap.has(unitKerjaData.id)) {
          unitKerjaMap.set(unitKerjaData.id, unitKerjaData);
        }
      });

      // Convert Map ke Array dan sort berdasarkan nama unit kerja
      const uniqueUnitKerja = Array.from(unitKerjaMap.values()).sort((a, b) => {
        if (a.unitKerja < b.unitKerja) return -1;
        if (a.unitKerja > b.unitKerja) return 1;
        return 0;
      });

      return res.status(200).json({ result: uniqueUnitKerja });
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
        where: {
          unitKerjaId: id,
        },
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja"],
          },
          {
            model: pegawai,
            attributes: ["id", "nama", "nip"],
          },
          {
            model: satuanIndikator,
            attributes: ["id", "satuan"],
          },
          {
            model: subKegPer,
            paranoid: true,
            attributes: ["id", "kode", "nama"],
          },
          {
            model: kegiatan,
            paranoid: true,
            attributes: ["id", "kode", "nama"],
          },
          {
            model: program,
            paranoid: true,
            attributes: ["id", "kode", "nama"],
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
                model: capaian,
                attributes: ["id", "nilai", "bulan", "anggaran"],
              },
              {
                model: targetTriwulan,
                attributes: ["id", "nilai"],
                include: [{ model: namaTarget, attributes: ["nama", "id"] }],
              },
            ],
          },
        ],
      });

      const resultJenisAnggaran = await jenisAnggaran.findAll({});
      const resultNamaTarget = await namaTarget.findAll({});
      return res.status(200).json({
        result,
        resultJenisAnggaran,
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
        paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
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
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  getDetailKegiatan: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDNya");
    try {
      const result = await kegiatan.findOne({
        where: { id },
        paranoid: true, // Hanya ambil kegiatan yang belum di-soft delete
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
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  getDetailProgram: async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id, "ini IDNya");
    try {
      const result = await program.findOne({
        where: { id },
        paranoid: true, // Hanya ambil program yang belum di-soft delete
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
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja"],
              },
              {
                model: pegawai,
                attributes: ["id", "nama", "nip"],
              },
              {
                model: satuanIndikator,
                attributes: ["id", "satuan"],
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

  postSubKegPer: async (req, res) => {
    const { nama, kode, unitKerjaId } = req.body;
    console.log(req.body);
    try {
      const result = await subKegPer.create({ nama, kode, unitKerjaId });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
};
