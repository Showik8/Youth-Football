const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "your_db_user",
  host: "localhost",
  database: "geoyouthfootball",
  password: process.env.DB_PASSWORD || "your_db_password",
  port: 5432,
});

module.exports = pool;
