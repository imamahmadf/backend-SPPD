const express = require("express");
const { rekapControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", rekapControllers.getPerjalanan);
routers.get("/get/sppd", rekapControllers.getSPPD);
routers.post("/post/sppd", rekapControllers.postSPPD);

module.exports = routers;
