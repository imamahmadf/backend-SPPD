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

// ========== KINERJA PJPL ROUTES ==========
routers.post("/post/kinerja-pjpl", PJPLControllers.postKinerjaPJPL);
routers.get("/get/kinerja-pjpl", PJPLControllers.getKinerjaPJPL);
routers.get("/get/kinerja-pjpl/:id", PJPLControllers.getKinerjaPJPLById);
routers.put("/put/kinerja-pjpl/:id", PJPLControllers.updateKinerjaPJPL);
routers.delete("/delete/kinerja-pjpl/:id", PJPLControllers.deleteKinerjaPJPL);

// ========== REALISASI PJPL ROUTES ==========
routers.post("/post/realisasi-pjpl", PJPLControllers.postRealisasiPJPL);
routers.get("/get/realisasi-pjpl", PJPLControllers.getRealisasiPJPL);
routers.get("/get/realisasi-pjpl/:id", PJPLControllers.getRealisasiPJPLById);
routers.put("/put/realisasi-pjpl/:id", PJPLControllers.updateRealisasiPJPL);
routers.delete(
  "/delete/realisasi-pjpl/:id",
  PJPLControllers.deleteRealisasiPJPL
);

// ========== HASIL KERJA PJPL ROUTES ==========
routers.post("/post/hasil-kerja-pjpl", PJPLControllers.postHasilKerjaPJPL);
routers.get("/get/hasil-kerja-pjpl", PJPLControllers.getHasilKerjaPJPL);
routers.get("/get/hasil-kerja-pjpl/:id", PJPLControllers.getHasilKerjaPJPLById);
routers.put("/put/hasil-kerja-pjpl/:id", PJPLControllers.updateHasilKerjaPJPL);
routers.delete(
  "/delete/hasil-kerja-pjpl/:id",
  PJPLControllers.deleteHasilKerjaPJPL
);

module.exports = routers;
