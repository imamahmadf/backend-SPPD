const express = require("express");
const { usulanPegawaiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.post(
  "/post/golongan",
  fileUploader({
    destinationFolder: "pegawai",
    fileType: "application/pdf",
    prefix: "USULAN",
  }).any(),

  usulanPegawaiControllers.postNaikGOlongan
);
routers.get("/get/detail/:id", usulanPegawaiControllers.getDetailusulan);
routers.post("/update/usulan-pangkat", usulanPegawaiControllers.updateStatus);
routers.post(
  "/update/",
  fileUploader({
    destinationFolder: "pegawai",
    fileType: "application/pdf",
    prefix: "USULAN",
  }).any(),

  usulanPegawaiControllers.updateUsulan
);

routers.post(
  "/update/usulan-pegawai",
  fileUploader({
    destinationFolder: "pegawai",
    fileType: "application/pdf",
    prefix: "USULAN",
  }).any(), // .any() → req.files, bukan req.file
  usulanPegawaiControllers.updateUsulan
);

module.exports = routers;
