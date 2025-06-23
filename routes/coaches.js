const express = require("express");
const pool = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM coaches");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM coaches WHERE coach_id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Coach not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { first_name, last_name, birth_date, team_id } = req.body;
    if (!first_name || !last_name || !team_id)
      return res.status(400).json({ error: "Missing required fields" });
    const result = await pool.query(
      "INSERT INTO coaches (first_name, last_name, birth_date, team_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [first_name, last_name, birth_date, team_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, birth_date, team_id } = req.body;
    const result = await pool.query(
      "UPDATE coaches SET first_name = $1, last_name = $2, birth_date = $3, team_id = $4 WHERE coach_id = $5 RETURNING *",
      [first_name, last_name, birth_date, team_id, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Coach not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM coaches WHERE coach_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Coach not found" });
    res.json({ message: "Coach deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
