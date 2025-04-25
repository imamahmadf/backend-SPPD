const express = require("express");
const { tujuanControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/dalam-kota", tujuanControllers.getDalamKota);

module.exports = routers;
