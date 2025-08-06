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
const path = require("path");

module.exports = {
  postNaikGOlongan: async (req, res) => {
    const { pegawaiId } = req.body;
    try {
      // req.files adalah array
      // Contoh: [{ fieldname: 'formulir_usulan', filename: 'UNDANGAN_xxx.pdf', ... }, ...]
      const files = req.files;
      const filePaths = {};

      files.forEach((file) => {
        // Simpan path file sesuai fieldname
        filePaths[file.fieldname] = `/pegawai/${file.filename}`;
      });

      // Mapping nama field dari frontend ke field DB
      const dataToSave = {
        pegawaiId,
        formulirUsulan: filePaths["formulirUsulan"],
        skCpns: filePaths["skCpns"],
        skPns: filePaths["skPns"],
        PAK: filePaths["PAK"],
        skJafung: filePaths["skJafung"],
        skp: filePaths["skp"],
        skMutasi: filePaths["skMutasi"],
        STR: filePaths["STR"],
        suratCuti: filePaths["suratCuti"],
        status: 0,
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

  // updateUsulan: async (req, res) => {
  //   try {
  //     const { id } = req.body;
  //     console.log(id, "cek id");
  //     const field = Object.keys(req.body).find(
  //       (key) => key !== "id" && key !== "pegawaiId"
  //     );
  //     const file = req.files.find((f) => f.fieldname === field);

  //     if (!file)
  //       return res.status(400).json({ message: "File tidak ditemukan" });

  //     const usulan = await usulanPegawai.findByPk(id);
  //     if (!usulan) {
  //       fs.unlinkSync(file.path);
  //       return res.status(404).json({ message: "Data tidak ditemukan" });
  //     }

  //     // Hapus file lama jika ada
  //     if (usulan[field]) {
  //       const oldPath = path.join(
  //         __dirname,
  //         "../public/pegawai",
  //         usulan[field]
  //       );
  //       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  //     }

  //     usulan[field] = file.filename;
  //     await usulan.save();

  //     res.json({
  //       message: "Dokumen berhasil diupdate",
  //       dokumen: file.filename,
  //       field,
  //     });
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: "Terjadi kesalahan", error: error.message });
  //   }
  // },

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
    const { id, catatan, statusId } = req.body;
    let status = catatan ? 2 : 1;

    if (statusId === 0) {
      status = statusId;
    }

    //2 ditolak, 1 diterima
    console.log(statusId);
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
  updateUsulan: async (req, res) => {
    try {
      const { id, field_name, nama_file_lama } = req.body;
      console.log(field_name);
      // Validasi file
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Harap unggah file" });
      }

      const uploadedFile = req.files[0];

      // Hapus file lama jika ada
      if (nama_file_lama) {
        const fullPath = path.join(__dirname, `../public${nama_file_lama}`);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error("Gagal menghapus file lama:", err);
          }
        });
      }

      // Path file baru
      const filePath = `/pegawai/${uploadedFile.filename}`;

      // Update field dinamis berdasarkan field_name
      await usulanPegawai.update({ [field_name]: filePath }, { where: { id } });

      res.json({
        message: "Dokumen berhasil diupdate",
        path: filePath,
      });
    } catch (error) {
      console.error("Error saat update usulan pegawai:", error);
      res.status(500).json({
        message: "Terjadi kesalahan saat upload dokumen",
        error: error.message,
      });
    }
  },
};
