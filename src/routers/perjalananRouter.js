const express = require("express");
const { perjalananControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/nota-dinas", perjalananControllers.postNotaDinas);
routers.post("/post/surat-tugas", perjalananControllers.postSuratTugas);
routers.get("/get/seed", perjalananControllers.getSeedPerjalanan);
routers.get("/get/all-perjalanan", perjalananControllers.getAllPerjalanan);
routers.get(
  "/get/detail-perjalanan/:id",
  perjalananControllers.getDetailPerjalanan
);
routers.get(
  "/get/jenis-perjalanan/:id",
  perjalananControllers.getJenisPerjalanan
);

module.exports = routers;
