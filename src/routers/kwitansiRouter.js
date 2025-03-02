const express = require("express");
const { kwitansiControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/rampung", kwitansiControllers.postRampung);
routers.get("/get/rampung/:id", kwitansiControllers.getRampung);
routers.post("/post/cetak-kwitansi", kwitansiControllers.cetakKwitansi);

module.exports = routers;
