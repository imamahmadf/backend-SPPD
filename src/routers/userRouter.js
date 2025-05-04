const express = require("express");
const { userControllers } = require("../controllers");
const { authenticateUser, authorizeRole } = require("../lib/auth");

const router = express.Router();

// Public routes (tidak butuh login)
router.post("/register", userControllers.register);
router.post("/login", userControllers.login);

// Protected routes (harus login)
router.post("/logout", authenticateUser, userControllers.logout);
router.get("/check-auth", authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
});
router.get("/profile", authenticateUser, userControllers.getProfile);

// Admin-only routes (harus login DAN role admin)
router.get(
  "/admin-dashboard",
  authenticateUser,
  authorizeRole(["admin"]),
  userControllers.adminDashboard
);

module.exports = router;
