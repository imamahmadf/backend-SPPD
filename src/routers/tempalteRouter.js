const express = require("express");
const fileUploader = require("../middleware/uploader");
const templateControllers = require("../controllers/templateControllers");

const router = express.Router();

router.post(
  "/upload",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE",
  }).single("file"),
  templateControllers.uploadTemplate
);

router.get("/get", templateControllers.getTemplate);

module.exports = router;
