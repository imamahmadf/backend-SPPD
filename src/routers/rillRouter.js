const express = require("express");
const { rillControllers } = require("../controllers");

const routers = express.Router();

routers.post("/post", rillControllers.postRill);

module.exports = routers;
