const express = require("express");
const { perencanaanControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", perencanaanControllers.getAllProgram);
routers.get("/get/indikator/:id", perencanaanControllers.getAllIndikator);
routers.get(
  "/get/detail-sub-kegiatan/:id",
  perencanaanControllers.getDetailSubKegiatan
);
routers.post("/post/target", perencanaanControllers.postTarget);
routers.post("/post/capaian", perencanaanControllers.postCapaian);

module.exports = routers;
