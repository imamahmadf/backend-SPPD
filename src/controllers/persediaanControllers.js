const {
  tipePersediaan,
  persediaan,
  stokMasuk,
  stokKeluar,
} = require("../models");

const { Op } = require("sequelize");

module.exports = {
  getAllPersediaan: async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;

    try {
      // 1. Ambil data kendaraan dari DB lokal
      const result = await persediaan.findAll({
        limit,

        offset,
        include: [{ model: tipePersediaan }],
        order: [["id", "ASC"]],
      });

      const totalRows = await persediaan.count({
        limit,

        offset,
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
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  getSeed: async (req, res) => {
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const resultTipe = await tipePersediaan.findAll({});

      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        resultTipe,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },

  postPersediaan: async (req, res) => {
    const { nama, kode, NUSP, tipeId } = req.body;
    console.log(req.body);
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const result = await persediaan.create({
        nama,
        kodeBarang: kode,
        NUSP,
        tipePersediaanId: tipeId,
      });

      // 2. Ambil semua ID unik dari pegawaiId dan PJId

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  getStokMasuk: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    console.log(req.body);
    try {
      // 1. Ambil data kendaraan dari DB lokal
      const result = await stokMasuk.findAll({
        where: { unitKerjaId: id },
        include: [{ model: persediaan }],
        limit,

        offset,
      });
      const totalRows = await stokMasuk.count({
        limit,

        offset,
        where: { unitKerjaId: id },
      });
      const totalPage = Math.ceil(totalRows / limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  searchPersediaan: async (req, res) => {
    try {
      const { q } = req.query;

      const result = await persediaan.findAll({
        where: {
          nama: {
            [Op.like]: `%${q}%`, // Import Op dari Sequelize
          },
        },
        attributes: ["id", "nama"],
        limit: 10,
        order: [["nama", "ASC"]],
      });

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err.toString(), code: 500 });
    }
  },
  postMasuk: async (req, res) => {
    const {
      persediaanId,
      unitKerjaId,
      jumlah,
      harga,
      tanggal,
      keterangan,
      spesifikasi,
    } = req.body;
    console.log(req.body);
    try {
      const result = await stokMasuk.create({
        persediaanId,
        unitKerjaId,
        jumlah,
        hargaSatuan: harga,
        tanggal,
        keterangan,
        spesifikasi,
      });

      return res.status(200).json({
        result,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data kendaraan dan pegawai",
        error: err.toString(),
      });
    }
  },
  getStok: async (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;
    const offset = limit * page;
    console.log(req.body);
    try {
      // 1. Ambil data stokMasuk dari DB lokal
      const allStokMasuk = await stokMasuk.findAll({
        where: { unitKerjaId: id },
        include: [{ model: persediaan }, { model: stokKeluar }],
      });

      // 2. Filter data yang jumlah stokMasuk - stokKeluar tidak sama dengan 0
      const filteredResult = allStokMasuk.filter((stok) => {
        const totalKeluar = stok.stokKeluars
          ? stok.stokKeluars.reduce((sum, keluar) => sum + keluar.jumlah, 0)
          : 0;
        const sisaStok = stok.jumlah - totalKeluar;
        return sisaStok > 0;
      });

      // 3. Implementasi pagination manual
      const totalRows = filteredResult.length;
      const totalPage = Math.ceil(totalRows / limit);
      const result = filteredResult.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        result,
        page,
        limit,
        totalRows,
        totalPage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data stok dan persediaan",
        error: err.toString(),
      });
    }
  },
};
