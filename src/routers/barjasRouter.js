const express = require("express");
const { barjasControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/dokumen/:id", barjasControllers.getDokumen);
routers.get("/get", barjasControllers.getAll);
routers.post("/post/sp", barjasControllers.postSP);
routers.post("/post/dokumen-barjas", barjasControllers.postBarjas);
routers.post("/post/barjas", barjasControllers.postBarjas);
routers.get("/get/seed/:id", barjasControllers.getSeed);
routers.get("/get/sub-kegiatan/search", barjasControllers.searchSubKegiatan);
routers.get("/get/rekanan/search", barjasControllers.searchRekanan);
routers.get("/get/seed-detail", barjasControllers.getDetilSeed);
routers.post("/post/tambah-dokumen", barjasControllers.postDokumenBarjas);
routers.post("/post/rekanan", barjasControllers.postRekanan);
routers.get("/get/download", barjasControllers.getDownloadBarjas);
module.exports = routers;
