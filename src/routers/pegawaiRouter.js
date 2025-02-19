const express = require("express");
const { pegawaiControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get", pegawaiControllers.getPegawai);

module.exports = routers;
