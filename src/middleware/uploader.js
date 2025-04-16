// const multer = require("multer");
// const { nanoid } = require("nanoid");
// const path = require("path");

// const fileUploader = ({
//   destinationFolder = "template",
//   prefix = "TEMPLATE",
// }) => {
//   const storageConfig = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, path.join(__dirname, "../public", destinationFolder));
//     },
//     filename: (req, file, cb) => {
//       const filename = `${prefix}_${nanoid()}.docx`; // Nama file berubah
//       cb(null, filename);
//     },
//   });

//   const uploader = multer({ storage: storageConfig });

//   return uploader;
// };

// module.exports = fileUploader;

const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const fs = require("fs");

const fileUploader = ({
  destinationFolder = "uploads",
  fileTypes = [],
  prefix = "",
} = {}) => {
  const uploadPath = path.join(__dirname, `../public/${destinationFolder}`);

  // Buat folder jika belum ada
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${prefix}_${nanoid(10)}${fileExt}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (fileTypes.length === 0 || fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  };

  return multer({ storage: storageConfig, fileFilter });
};

module.exports = fileUploader;
