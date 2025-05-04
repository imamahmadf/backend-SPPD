const {
  user,
  profile,
  userRole,
  sequelize,
  role,
  indukUnitKerja,
  daftarUnitKerja,
} = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { blacklistedTokens } = require("../lib/auth");

module.exports = {
  register: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { nama, namaPengguna, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await user.findOne({ where: { namaPengguna } });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const newUser = await user.create(
        {
          nama,
          namaPengguna,
          password: hashedPassword,
          role,
        },
        { transaction }
      );

      const newProfile = await profile.create(
        {
          nama,
          userId: newUser.id,
          unitKerjaId: 1,
        },
        { transaction }
      );

      const newUserRole = await userRole.create(
        {
          userId: newUser.id,
          roleId: 1,
        },
        { transaction }
      );

      await transaction.commit();
      res.status(201).json({ message: "Registrasi berhasil" });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { namaPengguna, password } = req.body;
      const resultUser = await user.findOne({
        where: { namaPengguna },
        include: [
          { model: userRole, include: [{ model: role, attributes: ["nama"] }] },
          {
            model: profile,
            attributes: ["id", "nama", "profilePic"],
            include: [
              {
                model: daftarUnitKerja,
                attributes: ["id", "unitKerja", "kode", "asal"],
                as: "unitKerja_profile",
                include: [
                  { model: indukUnitKerja, attributes: ["id", "kodeInduk"] },
                ],
              },
            ],
          },
        ],
      });

      if (!resultUser) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        resultUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const token = jwt.sign(
        { id: resultUser.id, role: resultUser.role },
        process.env.JWT_SECRET || "SECRET_KEY",
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: resultUser.profiles,
        role: resultUser.userRoles,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        return res.status(400).json({ message: "No token provided" });
      }

      // Tambahkan token ke blacklist
      blacklistedTokens.add(token);

      res.json({ message: "Logout berhasil" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Contoh endpoint yang dilindungi
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const userProfile = await profile.findOne({ where: { userId } });
      res.json(userProfile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Contoh endpoint khusus admin
  adminDashboard: async (req, res) => {
    try {
      res.json({ message: "Ini adalah dashboard admin" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
