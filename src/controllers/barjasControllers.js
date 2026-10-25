const {
  SP,
  akunBelanja,
  barjas,
  dokumenBarjas,
  jenisDokumenBarjas,
  rekanan,
  jenisBelanja,
  jenisBarjas,
  subKegPer,
  nomorSP,

  indukUnitKerja,
  daftarUnitKerja,
  sequelize,
  itemDokumenBarjas,
  kendaraan,
  bangunan,
  persediaan,
  stokMasuk,
} = require("../models");

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

module.exports = {
  postSP: async (req, res) => {
    const {
      tanggal,
      rekananId,
      akunBelanjaId,
      subKegPerId,
      indukUnitKerjaId,
      nomorSPId,
      unitKerjaId,
      nomorSPManual,
    } = req.body;
    const transaction = await sequelize.transaction();
    console.log(req.body);
    try {
      let nomorSuratBaru;

      if (!nomorSPManual) {
        // 1️⃣ Ambil nomor terakhir dengan lock untuk menghindari race condition
        const nomorAwal = await nomorSP.findOne({
          where: { id: nomorSPId },
          transaction,
          lock: true, // lock row untuk menghindari race condition
        });

        if (!nomorAwal) {
          throw new Error(
            "Nomor loket belum diinisialisasi untuk unit kerja ini"
          );
        }

        // 2️⃣ Hitung nomor baru
        const nomorTerbaru = nomorAwal.nomorLoket + 1;

        // 3️⃣ Update nomor berikutnya
        await nomorSP.update(
          { nomorLoket: nomorTerbaru },
          { where: { id: nomorAwal.id }, transaction }
        );

        // 4️⃣ Format nomor surat dengan nomor terbaru
        nomorSuratBaru = nomorAwal.nomorSurat
          .replace("NOMOR", nomorTerbaru)
          .replace("TAHUN", new Date(tanggal).getFullYear());
      }

      // 4️⃣ Buat entri SP baru
      const result = await SP.create(
        {
          nomor: nomorSPManual ? nomorSPManual : nomorSuratBaru,
          tanggal,
          rekananId,
          akunBelanjaId,
          subKegPerId,
          nomorSPId,
          unitKerjaId,
        },
        { transaction }
      );

      // 5️⃣ Commit transaksi
      await transaction.commit();
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDokumen: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await SP.findOne({
        where: { id },
        include: [
          {
            model: dokumenBarjas,
            include: [
              { model: jenisDokumenBarjas },
              {
                model: itemDokumenBarjas,
                attributes: ["id", "jumlah", "barjasId"],
                include: [
                  {
                    model: barjas,
                    attributes: ["id", "nama", "jumlah", "harga"],
                  },
                ],
              },
            ],
          },
          { model: rekanan },
          { model: akunBelanja, include: [{ model: jenisBelanja }] },
          { model: barjas, include: [{ model: jenisBarjas }] },
          {
            model: subKegPer,
            paranoid: true, // Hanya ambil subKegPer yang belum di-soft delete
            include: [
              { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
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
  getSeed: async (req, res) => {
    const id = req.params.id;
    const { indukUnitKerjaId } = req.body;
    console.log(req.body, id, "ini dr FE");
    try {
      const resultAkunBelanja = await akunBelanja.findAll({
        include: [{ model: jenisBelanja }],
      });
      const resultNomorSP = await nomorSP.findAll({
        include: [
          {
            model: indukUnitKerja,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id"],
                where: { id },
                required: true,
              },
            ],
          },
        ],
      });
      // const resultUnitKerja = await daftarUnitKerja.findAll({
      //   attributes: ["id", "unitKerja"],
      // });
      return res.status(200).json({ resultNomorSP, resultAkunBelanja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postDokumenBarjas: async (req, res) => {
    const {
      tanggal,
      nomor,
      SPId,
      jenisDokumenBarjasId,
      indukUnitKerjaId,
      barjasData, // array of objects: [{ barjasId, jumlah }]
    } = req.body;

    const transaction = await sequelize.transaction();
    try {
      // 1️⃣ Ambil nomor awal dari jenis dokumen
      const nomorAwal = await jenisDokumenBarjas.findOne({
        where: { id: jenisDokumenBarjasId, indukUnitKerjaId },
        transaction,
      });

      if (!nomorAwal) {
        throw new Error("Jenis dokumen tidak ditemukan.");
      }

      // 2️⃣ Update nomor loket +1
      const nomorTerbaru = nomorAwal.nomorLoket + 1;
      await jenisDokumenBarjas.update(
        { nomorLoket: nomorTerbaru },
        { where: { id: nomorAwal.id }, transaction }
      );

      // 3️⃣ Format nomor surat terbaru
      const nomorSuratTerbaru = nomorAwal.nomorSurat
        .replace("NOMOR", nomorTerbaru)
        .replace("TAHUN", new Date(tanggal).getFullYear());

      // 4️⃣ Simpan dokumen utama
      const dokumen = await dokumenBarjas.create(
        {
          tanggal,
          nomor: nomorSuratTerbaru,
          SPId,
          jenisDokumenBarjasId,
        },
        { transaction }
      );

      // 5️⃣ Siapkan data item dokumen dari array barjasData
      if (Array.isArray(barjasData) && barjasData.length > 0) {
        const items = barjasData.map((item) => ({
          dokumenBarjasId: dokumen.id, // foreign key ke dokumenBarjas
          barjasId: item.barjasId, // pastikan kolom di model sesuai
          jumlah: item.jumlah,
        }));

        // 6️⃣ Simpan semua item sekaligus
        await itemDokumenBarjas.bulkCreate(items, { transaction });
      }

      // 7️⃣ Commit transaksi
      await transaction.commit();

      return res.status(201).json({
        message: "Dokumen dan item berhasil disimpan",
        dokumen,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Error simpan dokumenBarjas:", err);
      res.status(500).json({ error: err.message });
    }
  },

  editDokumenBarjas: async (req, res) => {
    const { id, tanggal, nomor, jenisDokumenBarjasId, barjasData } = req.body;
    const transaction = await sequelize.transaction();

    try {
      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ error: "id wajib diisi" });
      }

      const dokumen = await dokumenBarjas.findOne({
        where: { id },
        transaction,
      });
      if (!dokumen) {
        await transaction.rollback();
        return res.status(404).json({ error: "Dokumen tidak ditemukan" });
      }

      const tanggalBaru = tanggal ?? dokumen.tanggal;
      const jenisBaru =
        jenisDokumenBarjasId ?? dokumen.jenisDokumenBarjasId;

      if (jenisDokumenBarjasId) {
        const jenis = await jenisDokumenBarjas.findOne({
          where: { id: jenisDokumenBarjasId },
          transaction,
        });
        if (!jenis) {
          await transaction.rollback();
          return res
            .status(404)
            .json({ error: "Jenis dokumen tidak ditemukan" });
        }
      }

      let nomorBaru =
        typeof nomor === "string" ? nomor.trim() : dokumen.nomor;

      if (typeof nomor === "string" && !nomorBaru) {
        await transaction.rollback();
        return res.status(400).json({ error: "Nomor dokumen wajib diisi" });
      }

      // Jika nomor tidak dikirim, sesuaikan tahun di nomor dengan tanggal baru.
      if (nomor === undefined || nomor === null) {
        const tahunBaru =
          tanggalBaru && !Number.isNaN(new Date(tanggalBaru).getTime())
            ? String(new Date(tanggalBaru).getFullYear())
            : null;

        if (tahunBaru && typeof nomorBaru === "string") {
          if (/\d{4}\s*$/.test(nomorBaru)) {
            nomorBaru = nomorBaru.replace(/\d{4}\s*$/, tahunBaru);
          } else if (/\d{4}/.test(nomorBaru)) {
            nomorBaru = nomorBaru.replace(/\d{4}/, tahunBaru);
          }
        }
      }

      await dokumenBarjas.update(
        {
          tanggal: tanggalBaru,
          nomor: nomorBaru,
          jenisDokumenBarjasId: jenisBaru,
        },
        { where: { id }, transaction }
      );

      if (Array.isArray(barjasData)) {
        await itemDokumenBarjas.destroy({
          where: { dokumenBarjasId: id },
          transaction,
        });

        if (barjasData.length > 0) {
          const items = barjasData.map((item) => ({
            dokumenBarjasId: id,
            barjasId: item.barjasId,
            jumlah: item.jumlah,
          }));
          await itemDokumenBarjas.bulkCreate(items, { transaction });
        }
      }

      await transaction.commit();

      const result = await dokumenBarjas.findOne({
        where: { id },
        include: [
          { model: jenisDokumenBarjas },
          {
            model: itemDokumenBarjas,
            attributes: ["id", "jumlah", "barjasId"],
            include: [
              {
                model: barjas,
                attributes: ["id", "nama", "jumlah", "harga"],
              },
            ],
          },
        ],
      });
      return res.status(200).json({ result });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteDokumen: async (req, res) => {
    const { id } = req.body;
    const transaction = await sequelize.transaction();
    try {
      if (!id) {
        await transaction.rollback();
        return res.status(400).json({ message: "id wajib diisi" });
      }

      const dokumen = await dokumenBarjas.findOne({
        where: { id },
        transaction,
      });
      if (!dokumen) {
        await transaction.rollback();
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      await itemDokumenBarjas.destroy({
        where: { dokumenBarjasId: id },
        transaction,
      });
      await dokumenBarjas.destroy({
        where: { id },
        transaction,
      });

      await transaction.commit();
      return res.status(200).json({ message: "Dokumen berhasil dihapus" });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  postBarjas: async (req, res) => {
    const { data } = req.body; // array of object
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Data tidak boleh kosong" });
      }

      const result = await barjas.bulkCreate(data, {
        validate: true, // pastikan semua record divalidasi sesuai model
      });

      return res.status(201).json({
        message: `${result.length} dokumen berhasil disimpan`,
        result,
      });
    } catch (err) {
      console.error("Error simpan dokumenBarjas:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getAll: async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = limit * page;
    const unitKerjaId = parseInt(req.query.unitKerjaId, 10);
    const subKegPerId = parseInt(req.query.subKegPerId, 10);
    const rekananId = parseInt(req.query.rekananId, 10);
    const akunBelanjaId = parseInt(req.query.akunBelanjaId, 10);
    const nomor = String(req.query.nomor || "").trim();
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId, 10);
    const sortBy = req.query.sortBy || "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const allowedSort = {
      tanggal: "tanggal",
      nomor: "nomor",
      createdAt: "createdAt",
    };
    const sortField = allowedSort[sortBy] || "tanggal";

    const whereCondition = {};
    if (nomor) {
      whereCondition.nomor = { [Op.like]: `%${nomor}%` };
    }
    if (subKegPerId) {
      whereCondition.subKegPerId = subKegPerId;
    }
    if (rekananId) {
      whereCondition.rekananId = rekananId;
    }
    if (akunBelanjaId) {
      whereCondition.akunBelanjaId = akunBelanjaId;
    }
    if (startDate && endDate) {
      whereCondition.tanggal = {
        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`],
      };
    } else if (startDate) {
      whereCondition.tanggal = { [Op.gte]: `${startDate} 00:00:00` };
    } else if (endDate) {
      whereCondition.tanggal = { [Op.lte]: `${endDate} 23:59:59` };
    }

    const unitKerjaWhere = {};
    if (indukUnitKerjaId) {
      unitKerjaWhere.indukUnitKerjaId = indukUnitKerjaId;
    }
    if (unitKerjaId) {
      unitKerjaWhere.id = unitKerjaId;
    }

    const subKegPerInclude = {
      model: subKegPer,
      attributes: ["id", "nama"],
      paranoid: true,
      include: [
        {
          model: daftarUnitKerja,
          attributes: ["id", "unitKerja"],
          ...(Object.keys(unitKerjaWhere).length
            ? { where: unitKerjaWhere, required: true }
            : {}),
        },
      ],
      required: Boolean(Object.keys(unitKerjaWhere).length),
    };

    try {
      const order = [
        [sortField, sortOrder],
        ["id", "DESC"],
      ];

      const totalRows = await SP.count({
        where: whereCondition,
        include: [subKegPerInclude],
      });
      const totalPage = totalRows > 0 ? Math.ceil(totalRows / limit) : 0;

      const idRows = await SP.findAll({
        attributes: ["id"],
        where: whereCondition,
        include: [subKegPerInclude],
        order,
        limit,
        offset,
        subQuery: false,
        raw: true,
      });
      const ids = idRows.map((row) => row.id);

      const result =
        ids.length === 0
          ? []
          : await SP.findAll({
              where: { id: { [Op.in]: ids } },
              include: [
                {
                  model: dokumenBarjas,
                  include: [{ model: jenisDokumenBarjas }],
                  attributes: ["id"],
                },
                { model: rekanan },
                { model: akunBelanja, include: [{ model: jenisBelanja }] },
                {
                  model: barjas,
                  include: [{ model: jenisBarjas, attributes: ["id"] }],
                  attributes: ["id", "jumlah", "harga"],
                },
                {
                  model: subKegPer,
                  attributes: ["id", "nama"],
                  paranoid: true,
                  include: [
                    {
                      model: daftarUnitKerja,
                      attributes: ["id", "unitKerja"],
                    },
                  ],
                },
              ],
              order,
            });

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  searchSubKegiatan: async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId, 10);

      const where = {};
      if (q) {
        where[Op.or] = [
          { nama: { [Op.like]: `%${q}%` } },
          { kode: { [Op.like]: `%${q}%` } },
        ];
      }

      const unitKerjaWhere = Number.isInteger(indukUnitKerjaId)
        ? { indukUnitKerjaId }
        : {};

      const result = await subKegPer.findAll({
        where,
        attributes: ["id", "nama", "kode", "unitKerjaId"],
        paranoid: true,
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id", "unitKerja", "indukUnitKerjaId"],
            required: Boolean(Object.keys(unitKerjaWhere).length),
            ...(Object.keys(unitKerjaWhere).length
              ? { where: unitKerjaWhere }
              : {}),
          },
        ],
        limit: 25,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
  searchRekanan: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await rekanan.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },

        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },

  getDetilSeed: async (req, res) => {
    try {
      const resultJenisBarjas = await jenisBarjas.findAll({});
      const resultJenisDokumenBarjas = await jenisDokumenBarjas.findAll({});

      const resultAkunBelanja = await akunBelanja.findAll({
        include: [{ model: jenisBelanja }],
      });

      return res.status(200).json({
        resultJenisBarjas,
        resultJenisDokumenBarjas,
        resultAkunBelanja,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postRekanan: async (req, res) => {
    const nama = req.body.nama;
    try {
      const result = await rekanan.create({ nama });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDownloadBarjas: async (req, res) => {
    const unitKerjaId = parseInt(req.query.unitKerjaId, 10);
    const subKegPerId = parseInt(req.query.subKegPerId, 10);
    const rekananId = parseInt(req.query.rekananId, 10);
    const akunBelanjaId = parseInt(req.query.akunBelanjaId, 10);
    const nomor = String(req.query.nomor || "").trim();
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId, 10);
    const sortBy = req.query.sortBy || "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const allowedSort = {
      tanggal: "tanggal",
      nomor: "nomor",
      createdAt: "createdAt",
    };
    const sortField = allowedSort[sortBy] || "tanggal";

    const whereCondition = {};
    if (nomor) {
      whereCondition.nomor = { [Op.like]: `%${nomor}%` };
    }
    if (subKegPerId) {
      whereCondition.subKegPerId = subKegPerId;
    }
    if (rekananId) {
      whereCondition.rekananId = rekananId;
    }
    if (akunBelanjaId) {
      whereCondition.akunBelanjaId = akunBelanjaId;
    }
    if (startDate && endDate) {
      whereCondition.tanggal = {
        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`],
      };
    } else if (startDate) {
      whereCondition.tanggal = { [Op.gte]: `${startDate} 00:00:00` };
    } else if (endDate) {
      whereCondition.tanggal = { [Op.lte]: `${endDate} 23:59:59` };
    }

    const unitKerjaWhere = {};
    if (indukUnitKerjaId) {
      unitKerjaWhere.indukUnitKerjaId = indukUnitKerjaId;
    }
    if (unitKerjaId) {
      unitKerjaWhere.id = unitKerjaId;
    }

    const subKegPerInclude = {
      model: subKegPer,
      attributes: ["id", "nama"],
      paranoid: true,
      include: [
        {
          model: daftarUnitKerja,
          attributes: ["id", "unitKerja"],
          ...(Object.keys(unitKerjaWhere).length
            ? { where: unitKerjaWhere, required: true }
            : {}),
        },
      ],
      required: Boolean(Object.keys(unitKerjaWhere).length),
    };

    try {
      const order = [
        [sortField, sortOrder],
        ["id", "DESC"],
      ];

      const idRows = await SP.findAll({
        attributes: ["id"],
        where: whereCondition,
        include: [subKegPerInclude],
        order,
        subQuery: false,
        raw: true,
      });
      const ids = [...new Set(idRows.map((row) => row.id))];

      const result =
        ids.length === 0
          ? []
          : await SP.findAll({
              where: { id: { [Op.in]: ids } },
              include: [
                { model: rekanan, attributes: ["id", "nama"] },
                {
                  model: akunBelanja,
                  attributes: ["id", "akun", "kode"],
                  include: [
                    { model: jenisBelanja, attributes: ["id", "jenis"] },
                  ],
                },
                {
                  model: barjas,
                  attributes: ["id", "nama", "jumlah", "harga"],
                },
                {
                  model: subKegPer,
                  attributes: ["id", "nama"],
                  paranoid: true,
                  include: [
                    {
                      model: daftarUnitKerja,
                      attributes: ["id", "unitKerja"],
                    },
                  ],
                },
                {
                  model: dokumenBarjas,
                  attributes: [
                    "id",
                    "nomor",
                    "tanggal",
                    "jenisDokumenBarjasId",
                  ],
                  include: [
                    { model: jenisDokumenBarjas, attributes: ["id", "jenis"] },
                    {
                      model: itemDokumenBarjas,
                      attributes: ["id", "jumlah", "barjasId"],
                      include: [
                        {
                          model: barjas,
                          attributes: ["id", "nama", "harga"],
                        },
                      ],
                    },
                  ],
                },
              ],
              order,
            });

      const getDokumenPlain = (dokumen) =>
        dokumen && typeof dokumen.get === "function"
          ? dokumen.get({ plain: true })
          : dokumen || {};

      const getJenisDokumenNama = (dokumen) => {
        const plain = getDokumenPlain(dokumen);
        return (
          plain?.jenisDokumenBarja?.jenis ||
          plain?.jenisDokumenBarjas?.jenis ||
          "Dokumen"
        );
      };

      const jenisColumns = [];
      const seenJenis = new Set();
      result.forEach((sp) => {
        const spPlain =
          sp && typeof sp.get === "function" ? sp.get({ plain: true }) : sp;
        (spPlain.dokumenBarjas || []).forEach((dokumen) => {
          const nama = getJenisDokumenNama(dokumen);
          if (!seenJenis.has(nama)) {
            seenJenis.add(nama);
            jenisColumns.push({
              header: nama,
              key: `nomorJenis_${jenisColumns.length}`,
              width: Math.min(Math.max(nama.length + 4, 28), 48),
              nama,
            });
          }
        });
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "PENA DINKES";
      const sheetSP = workbook.addWorksheet("Daftar Surat Pesanan");
      const sheetDokumen = workbook.addWorksheet("Rincian Dokumen");

      sheetSP.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Nomor SP", key: "nomorSP", width: 32 },
        ...jenisColumns.map(({ header, key, width }) => ({
          header,
          key,
          width,
        })),
        { header: "Tanggal", key: "tanggal", width: 16 },
        { header: "Unit Kerja", key: "unitKerja", width: 28 },
        { header: "Sub Kegiatan", key: "subkegiatan", width: 36 },
        { header: "Akun Belanja", key: "akunBelanja", width: 32 },
        { header: "Jenis Belanja", key: "jenisBelanja", width: 22 },
        { header: "Rekanan", key: "rekanan", width: 28 },
        { header: "Jumlah Item", key: "jumlahItem", width: 14 },
        { header: "Nominal", key: "nominal", width: 18 },
      ];

      sheetDokumen.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Nomor SP", key: "nomorSP", width: 32 },
        { header: "Nomor Dokumen", key: "nomorDokumen", width: 32 },
        { header: "Jenis Dokumen", key: "jenisDokumen", width: 24 },
        { header: "Tanggal Dokumen", key: "tanggalDokumen", width: 16 },
        { header: "Nama Barang/Jasa", key: "namaBarang", width: 36 },
        { header: "Jumlah", key: "jumlah", width: 12 },
        { header: "Harga Satuan", key: "harga", width: 16 },
        { header: "Subtotal", key: "subtotal", width: 18 },
      ];

      const styleHeader = (sheet) => {
        const header = sheet.getRow(1);
        header.font = { bold: true, color: { argb: "FFFFFFFF" } };
        header.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF007DE2" },
        };
        header.alignment = { vertical: "middle", horizontal: "center" };
      };

      result.forEach((sp, index) => {
        const spPlain =
          sp && typeof sp.get === "function" ? sp.get({ plain: true }) : sp;
        const nominal = (spPlain.barjas || []).reduce(
          (sum, item) =>
            sum + Number(item?.harga || 0) * Number(item?.jumlah || 0),
          0
        );
        const dokumenList = spPlain.dokumenBarjas || [];

        const row = {
          no: index + 1,
          nomorSP: spPlain?.nomor || "-",
          tanggal: spPlain?.tanggal
            ? new Date(spPlain.tanggal).toLocaleDateString("id-ID")
            : "-",
          unitKerja: spPlain?.subKegPer?.daftarUnitKerja?.unitKerja || "-",
          subkegiatan: spPlain?.subKegPer?.nama || "-",
          akunBelanja: spPlain?.akunBelanja?.akun || "-",
          jenisBelanja: spPlain?.akunBelanja?.jenisBelanja?.jenis || "-",
          rekanan: spPlain?.rekanan?.nama || "-",
          jumlahItem: spPlain?.barjas?.length || 0,
          nominal,
        };

        jenisColumns.forEach((col) => {
          const numbers = dokumenList
            .filter((dokumen) => getJenisDokumenNama(dokumen) === col.nama)
            .map((dokumen) => getDokumenPlain(dokumen)?.nomor)
            .filter(Boolean);
          row[col.key] = numbers.length ? numbers.join("; ") : "-";
        });

        sheetSP.addRow(row);
      });

      let dokumenNo = 1;
      result.forEach((sp) => {
        (sp.dokumenBarjas || []).forEach((dokumen) => {
          const jenisDokumen =
            dokumen?.jenisDokumenBarja?.jenis ||
            dokumen?.jenisDokumenBarjas?.jenis ||
            "-";
          const items = dokumen?.itemDokumenBarjas || [];
          if (items.length === 0) {
            sheetDokumen.addRow({
              no: dokumenNo++,
              nomorSP: sp?.nomor || "-",
              nomorDokumen: dokumen?.nomor || "-",
              jenisDokumen,
              tanggalDokumen: dokumen?.tanggal
                ? new Date(dokumen.tanggal).toLocaleDateString("id-ID")
                : "-",
              namaBarang: "-",
              jumlah: 0,
              harga: 0,
              subtotal: 0,
            });
            return;
          }

          items.forEach((item) => {
            const barang = item?.barja || item?.barjas;
            const jumlah = Number(item?.jumlah || 0);
            const harga = Number(barang?.harga || 0);
            sheetDokumen.addRow({
              no: dokumenNo++,
              nomorSP: sp?.nomor || "-",
              nomorDokumen: dokumen?.nomor || "-",
              jenisDokumen,
              tanggalDokumen: dokumen?.tanggal
                ? new Date(dokumen.tanggal).toLocaleDateString("id-ID")
                : "-",
              namaBarang: barang?.nama || "-",
              jumlah,
              harga,
              subtotal: jumlah * harga,
            });
          });
        });
      });

      styleHeader(sheetSP);
      styleHeader(sheetDokumen);
      sheetSP.getColumn("nominal").numFmt = "#,##0";
      sheetDokumen.getColumn("harga").numFmt = "#,##0";
      sheetDokumen.getColumn("subtotal").numFmt = "#,##0";

      const filename = `daftar-surat-pesanan-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: err.message || "Gagal membuat file Excel",
        code: 500,
      });
    }
  },

  postAkunBelanja: async (req, res) => {
    const { akun, kode } = req.body;
    try {
      const result = await akunBelanja.create({ akun, kode });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDaftarDokumenBarjas: async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = limit * page;
    const nomor = String(req.query.nomor || "").trim();
    const nomorSP = String(req.query.nomorSP || "").trim();
    const jenisDokumenBarjasId = parseInt(req.query.jenisDokumenBarjasId, 10);
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sortBy = req.query.sortBy || "tanggal";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const allowedSort = {
      tanggal: "tanggal",
      nomor: "nomor",
      createdAt: "createdAt",
    };
    const sortField = allowedSort[sortBy] || "tanggal";

    const whereCondition = {};
    if (nomor) {
      whereCondition.nomor = { [Op.like]: `%${nomor}%` };
    }
    if (jenisDokumenBarjasId) {
      whereCondition.jenisDokumenBarjasId = jenisDokumenBarjasId;
    }
    if (startDate && endDate) {
      whereCondition.tanggal = {
        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`],
      };
    } else if (startDate) {
      whereCondition.tanggal = { [Op.gte]: `${startDate} 00:00:00` };
    } else if (endDate) {
      whereCondition.tanggal = { [Op.lte]: `${endDate} 23:59:59` };
    }

    const jenisInclude = {
      model: jenisDokumenBarjas,
      attributes: ["id", "jenis"],
      required: Boolean(indukUnitKerjaId),
    };
    if (indukUnitKerjaId) {
      jenisInclude.where = { indukUnitKerjaId };
    }

    const spInclude = {
      model: SP,
      attributes: ["id", "nomor", "tanggal"],
      required: Boolean(nomorSP),
      include: [{ model: rekanan, attributes: ["id", "nama"] }],
    };
    if (nomorSP) {
      spInclude.where = { nomor: { [Op.like]: `%${nomorSP}%` } };
    }

    try {
      const { count, rows } = await dokumenBarjas.findAndCountAll({
        where: whereCondition,
        attributes: [
          "id",
          "tanggal",
          "nomor",
          "SPId",
          "jenisDokumenBarjasId",
          "createdAt",
        ],
        include: [
          jenisInclude,
          spInclude,
          {
            model: itemDokumenBarjas,
            attributes: ["id", "jumlah"],
            separate: true,
          },
        ],
        distinct: true,
        limit,
        offset,
        order: [
          [sortField, sortOrder],
          ["id", "DESC"],
        ],
      });

      const totalRows = Array.isArray(count) ? count.length : count;
      const totalPage = totalRows > 0 ? Math.ceil(totalRows / limit) : 0;

      return res.status(200).json({
        success: true,
        result: rows,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getDaftarBarjas: async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = limit * page;
    const nama = String(req.query.nama || "").trim();
    const nomorSP = String(req.query.nomorSP || "").trim();
    const jenisBarjasId = parseInt(req.query.jenisBarjasId, 10);
    const indukUnitKerjaId = parseInt(req.query.indukUnitKerjaId, 10);
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder =
      String(req.query.sortOrder || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";
    const allowedSort = {
      nama: "nama",
      harga: "harga",
      jumlah: "jumlah",
      createdAt: "createdAt",
    };
    const sortField = allowedSort[sortBy] || "createdAt";

    const whereCondition = {};
    if (nama) {
      whereCondition.nama = { [Op.like]: `%${nama}%` };
    }
    if (jenisBarjasId) {
      whereCondition.jenisBarjasId = jenisBarjasId;
    }

    const batasiUnit = Boolean(indukUnitKerjaId);
    const spInclude = {
      model: SP,
      attributes: ["id", "nomor", "tanggal"],
      required: Boolean(nomorSP || batasiUnit),
      include: [
        { model: rekanan, attributes: ["id", "nama"] },
        {
          model: subKegPer,
          attributes: ["id", "nama"],
          paranoid: true,
          required: batasiUnit,
          include: [
            {
              model: daftarUnitKerja,
              attributes: ["id", "unitKerja"],
              required: batasiUnit,
              ...(batasiUnit ? { where: { indukUnitKerjaId } } : {}),
            },
          ],
        },
      ],
    };
    if (nomorSP) {
      spInclude.where = { nomor: { [Op.like]: `%${nomorSP}%` } };
    }

    try {
      const { count, rows } = await barjas.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "nama", "jumlah", "harga", "jenisBarjasId", "SPId"],
        include: [
          {
            model: jenisBarjas,
            attributes: ["id", "jenis"],
          },
          spInclude,
        ],
        distinct: true,
        limit,
        offset,
        order: [
          [sortField, sortOrder],
          ["id", "DESC"],
        ],
      });

      const totalRows = Array.isArray(count) ? count.length : count;
      const totalPage = totalRows > 0 ? Math.ceil(totalRows / limit) : 0;

      return res.status(200).json({
        success: true,
        result: rows,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  getJenisDokumen: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await jenisDokumenBarjas.findAll({
        where: { indukUnitKerjaId: id },
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisDokumen: async (req, res) => {
    const { jenis, indukUnitKerjaId, nomorSurat } = req.body;
    try {
      const result = await jenisDokumenBarjas.create({
        jenis,
        nomorSurat,
        nomorLoket: 0,
        indukUnitKerjaId,
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editJenisDokumen: async (req, res) => {
    const { jenis, indukUnitKerjaId, nomorSurat, id, nomorLoket } = req.body;
    try {
      const result = await jenisDokumenBarjas.update(
        {
          jenis,
          indukUnitKerjaId,
          nomorSurat,

          nomorLoket,
        },
        { where: { id } }
      );

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisBarjas: async (req, res) => {
    const { jenis } = req.body;
    try {
      const result = await jenisBarjas.create({ jenis });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postAkunBelanja: async (req, res) => {
    const { akun, jenisBelanjaId } = req.body;
    try {
      const result = await akunBelanja.create({ akun, jenisBelanjaId });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postJenisBelanja: async (req, res) => {
    const { jenis } = req.query;
    try {
      const result = await jenisBelanja.create({ jenis });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getPengaturan: async (req, res) => {
    try {
      const resultJenisBarjas = await jenisBarjas.findAll();
      const resultAkunBelanja = await akunBelanja.findAll({
        include: [{ model: jenisBelanja }],
      });
      const resultJenisBelanja = await jenisBelanja.findAll();

      return res
        .status(200)
        .json({ resultJenisBarjas, resultAkunBelanja, resultJenisBelanja });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editNomorSP: async (req, res) => {
    const { nomorSurat, id } = req.body;
    try {
      const result = await nomorSP.update({ nomorSurat }, { where: { id } });

      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editBarjas: async (req, res) => {
    const { id, nama, jenisBarjasId, jumlah, harga } = req.body;
    try {
      if (!id) {
        return res.status(400).json({ message: "id wajib diisi" });
      }
      if (!nama || !String(nama).trim()) {
        return res.status(400).json({ message: "Nama wajib diisi" });
      }
      if (!jenisBarjasId) {
        return res
          .status(400)
          .json({ message: "Jenis barang dan jasa wajib dipilih" });
      }

      const item = await barjas.findOne({ where: { id } });
      if (!item) {
        return res.status(404).json({ message: "Item tidak ditemukan" });
      }

      await barjas.update(
        {
          nama: String(nama).trim(),
          jenisBarjasId,
          jumlah: Number(jumlah) || 0,
          harga: Number(harga) || 0,
        },
        { where: { id } }
      );

      const result = await barjas.findOne({
        where: { id },
        include: [{ model: jenisBarjas }],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteBarjas: async (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    try {
      const result = await barjas.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editSP: async (req, res) => {
    const {
      id,
      nomor,
      tanggal,
      rekananId,
      akunBelanjaId,
      subKegPerId,
      unitKerjaId,
    } = req.body;

    try {
      if (!id) {
        return res.status(400).json({ message: "id wajib diisi" });
      }
      if (!nomor || !String(nomor).trim()) {
        return res.status(400).json({ message: "Nomor surat wajib diisi" });
      }
      if (!tanggal) {
        return res.status(400).json({ message: "Tanggal surat wajib diisi" });
      }
      if (!akunBelanjaId) {
        return res.status(400).json({ message: "Akun belanja wajib dipilih" });
      }
      if (!subKegPerId) {
        return res.status(400).json({ message: "Sub kegiatan wajib dipilih" });
      }

      const sp = await SP.findOne({ where: { id } });
      if (!sp) {
        return res.status(404).json({ message: "Surat pesanan tidak ditemukan" });
      }

      const subKeg = await subKegPer.findOne({
        where: { id: subKegPerId },
        attributes: ["id", "unitKerjaId"],
      });
      if (!subKeg) {
        return res.status(400).json({ message: "Sub kegiatan tidak ditemukan" });
      }

      const unitKerjaBaru = subKeg.unitKerjaId || unitKerjaId || sp.unitKerjaId;

      await SP.update(
        {
          nomor: String(nomor).trim(),
          tanggal,
          rekananId: rekananId || null,
          akunBelanjaId,
          subKegPerId,
          unitKerjaId: unitKerjaBaru,
        },
        { where: { id } }
      );

      const result = await SP.findOne({
        where: { id },
        include: [
          { model: rekanan },
          { model: akunBelanja, include: [{ model: jenisBelanja }] },
          {
            model: subKegPer,
            paranoid: true,
            include: [
              { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  deleteSP: async (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    try {
      const result = await SP.destroy({ where: { id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getNomorSP: async (req, res) => {
    const { id } = req.query;

    try {
      const result = await nomorSP.findAll({ where: { indukUnitKerjaId: id } });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  postNomorSP: async (req, res) => {
    const { indukUnitKerjaId, nomorSurat } = req.body;

    try {
      const result = await nomorSP.create({
        indukUnitKerjaId,
        nomorSurat,
        nomorLoket: 0,
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  editNomorSP: async (req, res) => {
    const { id, nomorSurat, nomorLoket } = req.body;

    try {
      const result = await nomorSP.update(
        {
          nomorSurat,
          nomorLoket,
        },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboardAset: async (req, res) => {
    try {
      const { indukUnitKerjaId } = req.query;

      // Siapkan where condition untuk filter indukUnitKerja jika ada
      const whereConditionBarjas = {};
      const whereConditionKendaraan = {};
      const whereConditionBangunan = {};
      const whereConditionPersediaan = {};

      // Filter berdasarkan indukUnitKerjaId jika ada
      let barjasInclude = [];
      let kendaraanInclude = [];

      if (indukUnitKerjaId) {
        whereConditionBangunan.indukUnitKerjaId = parseInt(indukUnitKerjaId);

        // Untuk barjas, filter melalui subKegPer -> daftarUnitKerja
        barjasInclude = [
          {
            model: subKegPer,
            required: true,
            paranoid: true,
            attributes: ["id", "nama", "kode", "kegiatanId", "unitKerjaId"],
            include: [
              {
                model: daftarUnitKerja,
                where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
                required: true,
                attributes: [
                  "id",
                  "unitKerja",
                  "kode",
                  "asal",
                  "indukUnitKerjaId",
                ],
              },
            ],
          },
        ];

        // Untuk kendaraan, filter melalui daftarUnitKerja
        kendaraanInclude = [
          {
            model: daftarUnitKerja,
            as: "kendaraanUK",
            where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
            required: true,
            attributes: ["id", "unitKerja", "kode", "asal", "indukUnitKerjaId"],
          },
        ];
      }

      // 1. Statistik Barjas (Barang dan Jasa)
      // Include jenisBelanja untuk membedakan barang dan jasa
      // Gabungkan include untuk jenisBelanja dengan filter indukUnitKerjaId
      const spIncludeBase = [
        {
          model: akunBelanja,
          required: true,
          include: [
            {
              model: jenisBelanja,
              required: true,
              attributes: ["id", "jenis"],
            },
          ],
          attributes: ["id", "akun", "kode", "jenisBelanjaId"],
        },
      ];

      // Jika ada filter indukUnitKerjaId, tambahkan include subKegPer
      const spIncludeWithFilter =
        barjasInclude.length > 0
          ? [...spIncludeBase, ...barjasInclude]
          : spIncludeBase;

      const totalSP = await SP.count({
        where: whereConditionBarjas,
        include: spIncludeWithFilter,
      });

      const totalBarjas = await barjas.count({
        include: [
          {
            model: SP,
            required: true,
            include: spIncludeWithFilter,
          },
        ],
      });

      // Hitung total nilai barjas dengan include jenisBelanja
      const barjasData = await barjas.findAll({
        attributes: [
          "harga",
          "jumlah",
          [sequelize.literal("harga * jumlah"), "totalNilai"],
        ],
        include: [
          {
            model: SP,
            required: true,
            include: spIncludeWithFilter,
          },
        ],
      });

      // Pisahkan barjas berdasarkan jenis belanja (barang vs jasa)
      let totalNilaiBarjasBarang = 0;
      let totalNilaiBarjasJasa = 0;
      let totalBarjasBarang = 0; // Jumlah item barjas jenis barang
      let totalBarjasJasa = 0; // Jumlah item barjas jenis jasa

      barjasData.forEach((item) => {
        const nilai = (item.harga || 0) * (item.jumlah || 0);
        const jenisBelanja =
          item?.SP?.akunBelanja?.jenisBelanja?.jenis?.toLowerCase() || "";

        if (jenisBelanja === "barang") {
          totalNilaiBarjasBarang += nilai;
          totalBarjasBarang += 1; // Hitung jumlah item, bukan jumlah unit
        } else if (jenisBelanja === "jasa") {
          totalNilaiBarjasJasa += nilai;
          totalBarjasJasa += 1; // Hitung jumlah item, bukan jumlah unit
        }
      });

      // 2. Statistik Kendaraan
      const totalKendaraan = await kendaraan.count({
        where: whereConditionKendaraan,
        include: kendaraanInclude,
      });

      // Hitung total nilai kendaraan (nilaiPerolehan)
      const kendaraanData = await kendaraan.findAll({
        attributes: ["nilaiPerolehan"],
        where: whereConditionKendaraan,
        include: kendaraanInclude,
      });

      const totalNilaiKendaraan = kendaraanData.reduce((sum, item) => {
        return sum + (parseInt(item.nilaiPerolehan) || 0);
      }, 0);

      // 3. Statistik Bangunan
      const totalBangunan = await bangunan.count({
        where: whereConditionBangunan,
      });

      // 4. Statistik Persediaan
      // Filter persediaan melalui stokMasuk -> daftarUnitKerja
      let stokMasukInclude = [];
      if (indukUnitKerjaId) {
        stokMasukInclude = [
          {
            model: daftarUnitKerja,
            where: { indukUnitKerjaId: parseInt(indukUnitKerjaId) },
            required: true,
            attributes: ["id", "unitKerja", "kode", "asal", "indukUnitKerjaId"],
          },
        ];
      }

      // Hitung total stok masuk untuk persediaan
      const stokMasukData = await stokMasuk.findAll({
        attributes: [
          "jumlah",
          "hargaSatuan",
          "persediaanId",
          [sequelize.literal("jumlah * hargaSatuan"), "totalNilai"],
        ],
        include: [
          {
            model: persediaan,
            required: true,
            where: whereConditionPersediaan,
          },
          ...stokMasukInclude,
        ],
      });

      const totalNilaiPersediaan = stokMasukData.reduce((sum, item) => {
        const total =
          (parseFloat(item.hargaSatuan) || 0) * (parseInt(item.jumlah) || 0);
        return sum + total;
      }, 0);

      // Hitung jumlah unik persediaan dari stokMasuk
      const persediaanUnikIds = [
        ...new Set(stokMasukData.map((item) => item.persediaanId)),
      ];
      const totalPersediaan = persediaanUnikIds.length;

      // Total stok masuk entries
      const totalStokMasuk = stokMasukData.length;

      // 5. Kategorisasi nilai aset
      // Belanja Modal = kendaraan + bangunan + barjas (jenis = "barang")
      const totalNilaiBelanjaModal =
        totalNilaiKendaraan + totalNilaiBarjasBarang;

      // Belanja Jasa = barjas (jenis = "jasa")
      const totalNilaiBelanjaJasa = totalNilaiBarjasJasa;

      // Persediaan = persediaan
      const totalNilaiPersediaanValue = totalNilaiPersediaan;

      // Total nilai semua aset
      const totalNilaiAset =
        totalNilaiBelanjaModal +
        totalNilaiBelanjaJasa +
        totalNilaiPersediaanValue;

      // 6. Ringkasan per kategori
      const ringkasan = {
        belanjaModal: {
          kendaraan: {
            total: totalKendaraan,
            totalNilai: totalNilaiKendaraan,
          },
          bangunan: {
            total: totalBangunan,
            totalNilai: 0, // Bangunan tidak memiliki nilai perolehan di model
          },
          barjasBarang: {
            total: totalBarjasBarang,
            totalNilai: totalNilaiBarjasBarang,
          },
          totalNilai: totalNilaiBelanjaModal,
        },
        belanjaJasa: {
          barjasJasa: {
            total: totalBarjasJasa,
            totalNilai: totalNilaiBelanjaJasa,
          },
          totalNilai: totalNilaiBelanjaJasa,
        },
        persediaan: {
          total: totalPersediaan,
          totalStokMasuk: totalStokMasuk,
          totalNilai: totalNilaiPersediaanValue,
        },
        ringkasanBarjas: {
          totalSP,
          totalBarjas,
          totalBarjasBarang,
          totalBarjasJasa,
          totalNilaiBarang: totalNilaiBarjasBarang,
          totalNilaiJasa: totalNilaiBarjasJasa,
        },
        total: {
          totalAset:
            totalBarjas + totalKendaraan + totalBangunan + totalPersediaan,
          totalNilai: totalNilaiAset,
        },
      };

      return res.status(200).json({
        success: true,
        data: ringkasan,
      });
    } catch (err) {
      console.error("Error getDashboardAset:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard aset",
        error: err.message,
      });
    }
  },
};
