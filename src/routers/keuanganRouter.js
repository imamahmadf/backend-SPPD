const express = require("express");
const { keuanganControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/bendahara/:id", keuanganControllers.getBendahara);

module.exports = routers;
