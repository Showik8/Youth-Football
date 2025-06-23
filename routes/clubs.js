const express = require("express");
const pool = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clubs");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM clubs WHERE club_id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Club not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { name, logo_url, city } = req.body;
    if (!name || !city)
      return res.status(400).json({ error: "Missing required fields" });
    const result = await pool.query(
      "INSERT INTO clubs (name, logo_url, city) VALUES ($1, $2, $3) RETURNING *",
      [name, logo_url, city]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url, city } = req.body;
    const result = await pool.query(
      "UPDATE clubs SET name = $1, logo_url = $2, city = $3 WHERE club_id = $4 RETURNING *",
      [name, logo_url, city, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Club not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM clubs WHERE club_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Club not found" });
    res.json({ message: "Club deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
