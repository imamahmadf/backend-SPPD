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
const authenticateUser = require("../lib/auth");
const blacklistedTokens = new Set(); // Simpan token yang di-blacklist

module.exports = {
  register: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { nama, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await user.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const newUser = await user.create(
        {
          nama,
          email,
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
      res.status(400).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const resultUser = await user.findOne({
        where: { email },
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
      if (!token) return res.status(400).json({ message: "No token provided" });

      blacklistedTokens.add(token); // Tambahkan token ke daftar blacklist

      res.json({ message: "Logout successful" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
