const { user } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../lib/auth");
const blacklistedTokens = new Set(); // Simpan token yang di-blacklist

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await user.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const newUser = await user.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      res.status(201).json({ message: "Registrasi berhasil", user: newUser });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const resultUser = await user.findOne({ where: { email } });

      if (!resultUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        resultUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: resultUser.id, role: resultUser.role },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "1h" }
      );

      res.json({ token, user: resultUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) return res.status(400).json({ message: "No token provided" });

      blacklistedTokens.add(token); // Tambahkan token ke daftar blacklist

      res.json({ message: "Logout successful" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
