const express = require("express");

const { adminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/detail-perjalanan/:id", adminControllers.detailPerjalanan);

module.exports = routers;
