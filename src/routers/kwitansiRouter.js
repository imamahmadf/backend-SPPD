const express = require("express");
const { kwitansiControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/rampung", kwitansiControllers.postRampung);
routers.get("/get/rampung/:id", kwitansiControllers.getRampung);
routers.post("/post/cetak-kwitansi", kwitansiControllers.cetakKwitansi);
routers.post(
  "/post/kwitansi-otomatis",
  kwitansiControllers.cetakKwitansiOtomatis
);
routers.post("/delete/rincian-bpd", kwitansiControllers.deleteBPD);
routers.post("/update/rincian-bpd", kwitansiControllers.updateBPD);

module.exports = routers;
