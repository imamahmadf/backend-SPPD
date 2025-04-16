const express = require("express");
const { kwitansiControllers } = require("../controllers");
const fileUploader = require("../middleware/uploader");
const routers = express.Router();

routers.post(
  "/post/rampung",
  fileUploader({
    destinationFolder: "bukti",
    fileType: "image",
    prefix: "BUKTI",
  }).single("pic"),
  kwitansiControllers.postRampung
);
routers.get("/get/rampung/:id", kwitansiControllers.getRampung);
routers.post("/post/cetak-kwitansi", kwitansiControllers.cetakKwitansi);
routers.post(
  "/post/kwitansi-otomatis",
  kwitansiControllers.cetakKwitansiOtomatis
);
routers.post("/delete/rincian-bpd", kwitansiControllers.deleteBPD);
routers.post("/update/rincian-bpd", kwitansiControllers.updateBPD);
routers.post("/verifikasi/terima", kwitansiControllers.terimaVerifikasi);
routers.post("/verifikasi/tolak", kwitansiControllers.tolakVerifikasi);
routers.post("/post/pengajuan/:id", kwitansiControllers.pengajuan);

module.exports = routers;
