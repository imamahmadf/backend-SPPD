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
  //   (req, res, next) => {
  //     // Debug: cek file dan body
  //     console.log("FILES:", req.files);
  //     console.log("BODY:", req.body);
  //     next();
  //   },
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
  //   (req, res, next) => {
  //     // Debug: cek file dan body
  //     console.log("FILES:", req.files);
  //     console.log("BODY:", req.body);
  //     next();
  //   },
  usulanPegawaiControllers.updateUsulan
);

module.exports = routers;
