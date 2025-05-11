const express = require("express");
const routers = express.Router();
const { nomorSuratControllers } = require("../controllers");

routers.get("/get/:id", nomorSuratControllers.getNomorSurat);
routers.post("/edit/:id", nomorSuratControllers.editNomorSurat);

module.exports = routers;
