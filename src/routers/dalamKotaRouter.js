const express = require("express");
const { dalamKotaControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post/surat-tugas", dalamKotaControllers.postSuratTugas);

module.exports = routers;
