const jwt = require("jsonwebtoken");

const blacklistedTokens = new Set(); // Simpan token yang di-blacklist

const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token expired or logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRole, isTokenBlacklisted };
