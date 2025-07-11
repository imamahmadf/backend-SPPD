const express = require("express");
const fileUploader = require("../middleware/uploader");
const templateControllers = require("../controllers/templateControllers");

const router = express.Router();
router.post(
  "/upload-keuangan",
  fileUploader({
    destinationFolder: "template-keuangan",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KEUANGAN",
  }).single("file"),
  templateControllers.addTemplateKeuangan
);
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

router.post(
  "/upload-kadis",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-KADIS",
  }).single("file"),
  templateControllers.uploadTemplateKadis
);

router.post(
  "/upload-aset",
  fileUploader({
    destinationFolder: "template",
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    prefix: "TEMPLATE-ASET",
  }).single("file"),
  templateControllers.uploadTemplateAset
);

router.post(
  "/upload-undangan",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "application/pdf",
    prefix: "UNDANGAN",
  }).single("file"),
  templateControllers.uploadUndangan
);

router.get("/get/:id", templateControllers.getTemplate);
router.get("/get-keuangan", templateControllers.getTemplateKeuangan);
router.get("/get-kadis", templateControllers.getTemplateKadis);
router.get("/get-aset", templateControllers.getTemplateAset);
router.get("/download", templateControllers.downloadTemplateKeuangan);
router.get("/download-undangan", templateControllers.downloadUndangan);

router.post(
  "/delete/template-keuangan/:id",
  templateControllers.deleteTempateKeuangan
);
module.exports = router;
