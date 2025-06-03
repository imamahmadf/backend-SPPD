const {
  indukUnitKerja,
  kadis,
  sequelize,
  templateKeuangan,
  user,
  userRole,
  role,
  profile,
} = require("../models");
const fs = require("fs");
module.exports = {
  getTemplateKeuangan: async (req, res) => {
    try {
      const result = await templateKeuangan.findAll({
        attributes: ["id", "nama", "template"],
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getTemplateKadis: async (req, res) => {
    try {
      const result = await kadis.findAll({});
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },

  addTemplateKeuangan: async (req, res) => {
    const { nama } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filePath = `/template-keuangan/${req.file.filename}`;
      await templateKeuangan.create({
        template: filePath,
        nama,
      });
      return res.status(200).json({ message: "template berhasil diupload" });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  uploadTemplate: async (req, res) => {
    const { id, jenis, kode } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }

      const filePath = `/template/${req.file.filename}`;

      if (jenis == 1) {
        await indukUnitKerja.update(
          {
            templateSuratTugas: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 2) {
        await indukUnitKerja.update(
          {
            templateNotaDinas: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      } else if (jenis == 3) {
        await indukUnitKerja.update(
          {
            templateSuratTugasSingkat: filePath, // Nama asli
          },
          {
            where: { id },
          }
        );
      }

      return res.status(200).json({
        message: "File template berhasil diunggah",
        filePath,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  uploadTemplateKadis: async (req, res) => {
    const { id, nomorSurat } = req.body;
    console.log(req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Harap unggah file .docx" });
      }

      const filename = req.body.oldFile;
      if (filename) {
        const path = `${__dirname}/../public${filename}`;
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        const filePath = `/template/${req.file.filename}`;

        await kadis.update(
          {
            template: filePath, // Nama asli
            nomorSurat,
          },
          {
            where: { id },
          }
        );
      } else {
        await kadis.create({
          template: `/template/${req.file.filename}`, // Nama asli
          nomorSurat,
        });
      }

      return res.status(200).json({
        message: "File template berhasil diunggah",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  getTemplate: async (req, res) => {
    console.log(req.params.id, "template");
    const id = req.params.id;
    try {
      const result = await indukUnitKerja.findOne({
        attributes: [
          "id",
          "indukUnitKerja",
          "templateSuratTugas",
          "templateNotaDinas",
          "templateSuratTugasSingkat",
        ],
        where: { id },
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
  downloadTemplateKeuangan: async (req, res) => {
    try {
      const { fileName } = req.query; // ← Ganti dari req.body ke req.query
      const filePath = `${__dirname}/../public/${fileName}`;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File tidak ditemukan" });
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      return res.download(filePath);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunduh file" });
    }
  },
  deleteTempateKeuangan: async (req, res) => {
    const id = req.params.id;
    const filename = req.body.fileName;
    try {
      const result = await templateKeuangan.destroy({ where: { id } });

      const path = `${__dirname}/../public${filename}`;
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      return res.status(200).json({ result });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah file" });
    }
  },
};
