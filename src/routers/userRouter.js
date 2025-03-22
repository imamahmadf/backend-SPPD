const express = require("express");
const { userControllers } = require("../controllers");
const { authenticateUser } = require("../lib/auth"); // Middleware auth

const routers = express.Router();

routers.post("/register", userControllers.register);
routers.post("/login", userControllers.login);
routers.post("/logout", authenticateUser, userControllers.logout); // Logout pakai middleware
routers.get("/check-auth", authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});

module.exports = routers;
