const express = require("express");
const { rekapControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", rekapControllers.getPerjalanan);

module.exports = routers;
