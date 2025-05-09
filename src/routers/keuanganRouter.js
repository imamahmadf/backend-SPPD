const express = require("express");
const { keuanganControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/bendahara/:id", keuanganControllers.getBendahara);
routers.post("/post/bendahara", keuanganControllers.postBendahara);
routers.get("/get/sumber-dana/:id", keuanganControllers.getSumberDana);
routers.post("/delete/bendahara/:id", keuanganControllers.deleteBendahara);

module.exports = routers;
