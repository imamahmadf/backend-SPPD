const express = require("express");
const { perencanaanAdminControllers } = require("../controllers");

const routers = express.Router();

routers.get("/get/sub-kegiatan", perencanaanAdminControllers.getSubKegiatan);

module.exports = routers;
