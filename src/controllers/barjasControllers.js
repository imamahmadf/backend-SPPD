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
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  postSP: async (req, res) => {
    const {
      tanggal,
      rekananId,
      akunBelanjaId,
      subKegPerId,
      indukUnitKerjaId,
      nomorSPId,
    } = req.body;
    const transaction = await sequelize.transaction();

    try {
      // 1️⃣ Ambil nomor terakhir
      const nomorAwal = await nomorSP.findOne({
        where: { indukUnitKerjaId },
        transaction,
        lock: transaction.LOCK.UPDATE, // penting untuk menghindari race condition
      });

      if (!nomorAwal) {
        throw new Error(
          "Nomor loket belum diinisialisasi untuk unit kerja ini"
        );
      }

      // 2️⃣ Update nomor berikutnya
      await nomorSP.update(
        { nomorLoket: nomorAwal.nomorLoket + 1 },
        { where: { id: nomorAwal.id }, transaction }
      );

      // 3️⃣ Ambil nilai terbaru setelah update (gunakan nomorLoket yang sudah di-update)
      const nomorTerbaru = nomorAwal.nomorLoket;
      let nomorSuratBaru;

      nomorSuratBaru = nomorAwal.nomorSurat
        .replace("NOMOR", nomorTerbaru)
        .replace("TAHUN", new Date(tanggal).getFullYear());

      // 4️⃣ Buat entri SP baru
      const result = await SP.create(
        {
          nomor: nomorSuratBaru,
          tanggal,
          rekananId,
          akunBelanjaId,
          subKegPerId,
          nomorSPId,
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
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    const unitKerjaId = parseInt(req.query.unitKerjaId);

    const nomor = parseInt(req.query.nomor) || "";
    const whereCondition = { nomor: { [Op.like]: "%" + nomor + "%" } };
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    try {
      const result = await SP.findAll(
        {
          limit,
          where: whereCondition,
          offset,
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
            // { model: nomorSP },
            {
              model: subKegPer,
              attributes: ["id", "nama"],
              include: [
                { model: daftarUnitKerja, attributes: ["id", "unitKerja"] },
              ],
            },
          ],
        }
        // { where: { id } }
      );
      const totalRows = await SP.count({
        where: whereCondition,
      });
      const totalPage = Math.ceil(totalRows / limit);
      // 2. Ambil semua ID unik dari pegawaiId dan PJId

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
      const { q, indukUnitKerjaId } = req.query;

      const result = await subKegPer.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: ["id", "nama", "unitKerjaId"],
        required: true,
        include: [
          {
            model: daftarUnitKerja,
            attributes: ["id"],
            required: true,
            where: { indukUnitKerjaId },
          },
        ],
        limit: 10,
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

      return res
        .status(200)
        .json({ resultJenisBarjas, resultJenisDokumenBarjas });
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
};
