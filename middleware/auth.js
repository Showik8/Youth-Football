const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET || "your_jwt_secret";

const authenticateAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    if (decoded.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    req.user = decoded;
    next();
  });
};

module.exports = { authenticateAdmin };
