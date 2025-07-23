const express = require("express");
const { usulanPegawaiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.post(
  "/post/golongan",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "application/pdf",
    prefix: "UNDANGAN",
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

module.exports = routers;
