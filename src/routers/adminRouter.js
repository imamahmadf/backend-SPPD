const express = require("express");

const { adminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/detail-perjalanan/:id", adminControllers.detailPerjalanan);
routers.get("/get/surat-keluar", adminControllers.getSuratKeluar);
routers.post("/post/surat-keluar", adminControllers.postSuratKeluar);
routers.get("/get/induk-unit-kerja", adminControllers.getIndukUnitKerja);
routers.get("/get/sumber-dana", adminControllers.getSumberDana);
routers.get("/get/unit-kerja", adminControllers.getUnitKerja);
routers.get(
  "/get/keuangan/daftar-perjalanan",
  adminControllers.getAllPerjalananKeuangan
);
routers.post("/delete/surat-keluar/:id", adminControllers.deleteSuratKeluar);
module.exports = routers;
