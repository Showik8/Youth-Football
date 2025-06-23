const express = require("express");
const pool = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teams");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM teams WHERE team_id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Team not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { club_id, name, age_category } = req.body;
    if (!club_id || !name || !age_category)
      return res.status(400).json({ error: "Missing required fields" });
    const result = await pool.query(
      "INSERT INTO teams (club_id, name, age_category) VALUES ($1, $2, $3) RETURNING *",
      [club_id, name, age_category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { club_id, name, age_category } = req.body;
    const result = await pool.query(
      "UPDATE teams SET club_id = $1, name = $2, age_category = $3 WHERE team_id = $4 RETURNING *",
      [club_id, name, age_category, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Team not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM teams WHERE team_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Team not found" });
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
