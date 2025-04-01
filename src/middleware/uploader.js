const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");

const fileUploader = ({
  destinationFolder = "template",
  prefix = "TEMPLATE",
}) => {
  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public", destinationFolder));
    },
    filename: (req, file, cb) => {
      const filename = `${prefix}_${nanoid()}.docx`; // Nama file berubah
      cb(null, filename);
    },
  });

  const uploader = multer({ storage: storageConfig });

  return uploader;
};

module.exports = fileUploader;
