const express = require("express");
const { PJPLControllers } = require("../controllers");

const routers = express.Router();

// routers.post("/post", PJPLControllers.tes);
routers.get("/get/pejabat-verifikator", PJPLControllers.getPejabatVerifikator);
routers.post(
  "/post/pejabat-verifikator",
  PJPLControllers.postPejabatVerifikator
);
routers.get("/get/indikator-pejabat/:id", PJPLControllers.getIndikatorPejabat);
routers.post("/post/indikator", PJPLControllers.postIndikator);
routers.get("/get/pegawai", PJPLControllers.getPJPLPegawai);
routers.post("/post/kontrak", PJPLControllers.postKontrak);
routers.get("/get/kontrak/:id", PJPLControllers.getKontrakPegawai);
routers.get("/get/detail-kontrak/:id", PJPLControllers.getDetailKontrak);
routers.get("/get/indikator-kinerja/:id", PJPLControllers.getIndikatorKinerja);
module.exports = routers;
