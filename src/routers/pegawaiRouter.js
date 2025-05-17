const express = require("express");
const { pegawaiControllers } = require("../controllers");
const { authenticateUser, authorizeRole } = require("../lib/auth");
const routers = express.Router();

routers.get("/get", pegawaiControllers.getPegawai);
routers.get(
  "/get/daftar",
  authenticateUser,
  pegawaiControllers.getDaftarPegawai
);
routers.get("/get/one-pegawai/:id", pegawaiControllers.getOnePegawai);
routers.get("/get/seed", pegawaiControllers.getSeedPegawai);
routers.post("/edit", pegawaiControllers.editPegawai);
routers.post("/post", pegawaiControllers.addPegawai);
routers.get("/get/detail-pegawai/:id", pegawaiControllers.getDetailPegawai);
routers.get("/search", pegawaiControllers.searchPegawai);

module.exports = routers;
