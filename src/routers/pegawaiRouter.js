const express = require("express");
const { pegawaiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", pegawaiControllers.getPegawai);
routers.get("/get/daftar", pegawaiControllers.getDaftarPegawai);
routers.get("/get/one-pegawai/:id", pegawaiControllers.getOnePegawai);
routers.get("/get/seed", pegawaiControllers.getSeedPegawai);
routers.post("/edit", pegawaiControllers.editPegawai);

module.exports = routers;
