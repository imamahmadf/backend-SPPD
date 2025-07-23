const {
  pegawai,
  golongan,
  pangkat,
  daftarTingkatan,
  daftarGolongan,
  daftarPangkat,
  daftarUnitKerja,
  dalamKota,
  profesi,
  statusPegawai,
  usulanPegawai, // tambahkan import model
} = require("../models");
const fs = require("fs");
const { Op } = require("sequelize");

module.exports = {
  postNaikGOlongan: async (req, res) => {
    try {
      // req.files adalah array
      // Contoh: [{ fieldname: 'formulir_usulan', filename: 'UNDANGAN_xxx.pdf', ... }, ...]
      const files = req.files;
      const filePaths = {};

      files.forEach((file) => {
        // Simpan path file sesuai fieldname
        filePaths[file.fieldname] = `/bukti/${file.filename}`;
      });

      // Mapping nama field dari frontend ke field DB
      const dataToSave = {
        pegawaiId: 1,
        formulirUsulan: filePaths.formulir_usulan,
        skCpns: filePaths["sk_cpns"],
        skPns: filePaths["sk_pns"],
        PAK: filePaths["pak"],
        skJafung: filePaths["sk_jafung_pertama"],
        skp: filePaths["skp_2tahun"],
        skMutasi: filePaths["sk_mutasi"],
        STR: filePaths["str_sip"],
        suratCuti: filePaths["surat_cuti"],
        // tambahkan field lain jika ada
      };
      console.log(filePaths, "CEK FILE");
      // Simpan ke database
      const result = await usulanPegawai.create(dataToSave);

      res.status(200).json({
        message: "File berhasil diupload dan path disimpan di database",
        data: result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
  getDetailusulan: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await usulanPegawai.findOne({
        where: { pegawaiId: id },
        include: [
          {
            model: pegawai,
            include: [
              {
                model: daftarTingkatan,
                as: "daftarTingkatan",
              },
              { model: daftarGolongan, as: "daftarGolongan" },
              { model: daftarPangkat, as: "daftarPangkat" },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id"],
              },
              { model: profesi, as: "profesi" },
              { model: statusPegawai, as: "statusPegawai" },
              {
                model: daftarUnitKerja,
                as: "daftarUnitKerja",
                attributes: ["id", "unitKerja", "indukUnitKerjaId"],
              },
            ],
          },
        ],
      });

      return res.status(200).json({ result });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({
        message: err.toString(),
        code: 500,
      });
    }
  },
  updateStatus: async (req, res) => {
    const { id, catatan } = req.body;
    const status = catatan ? 2 : 1;
    //2 ditolak, 1 diterima
    try {
      const result = await usulanPegawai.update(
        { catatan, status },
        { where: { id } }
      );
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
};
