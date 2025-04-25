const express = require("express");

const { adminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/detail-perjalanan/:id", adminControllers.detailPerjalanan);
routers.get("/get/surat-keluar", adminControllers.getSuratKeluar);
routers.post("/post/surat-keluar", adminControllers.postSuratKeluar);

module.exports = routers;
