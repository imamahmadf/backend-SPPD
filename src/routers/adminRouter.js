const express = require("express");

const { adminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/detail-perjalanan/:id", adminControllers.detailPerjalanan);
routers.get("/get/surat-keluar", adminControllers.getSuratKeluar);
routers.post("/post/surat-keluar", adminControllers.postSuratKeluar);
routers.get("/get/induk-unit-kerja", adminControllers.getIndukUnitKerja);
routers.get(
  "/get/keuangan/daftar-perjalanan",
  adminControllers.getAllPerjalananKeuangan
);
module.exports = routers;
