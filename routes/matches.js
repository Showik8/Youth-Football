const express = require("express");
const pool = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM matches";
    let params = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query +=
      " ORDER BY match_date LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM matches" + (status ? " WHERE status = $1" : ""),
      status ? [status] : []
    );
    const total = parseInt(totalResult.rows[0].count);

    res.json({
      matches: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM matches WHERE match_id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Match not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const {
      team1_id,
      team2_id,
      tournament_id,
      match_date,
      score_team1,
      score_team2,
      status,
      venue,
    } = req.body;
    if (!team1_id || !team2_id || !tournament_id || !match_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await pool.query(
      "INSERT INTO matches (team1_id, team2_id, tournament_id, match_date, score_team1, score_team2, status, venue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        team1_id,
        team2_id,
        tournament_id,
        match_date,
        score_team1,
        score_team2,
        status,
        venue,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      team1_id,
      team2_id,
      tournament_id,
      match_date,
      score_team1,
      score_team2,
      status,
      venue,
    } = req.body;
    const result = await pool.query(
      "UPDATE matches SET team1_id = $1, team2_id = $2, tournament_id = $3, match_date = $4, score_team1 = $5, score_team2 = $6, status = $7, venue = $8 WHERE match_id = $9 RETURNING *",
      [
        team1_id,
        team2_id,
        tournament_id,
        match_date,
        score_team1,
        score_team2,
        status,
        venue,
        id,
      ]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Match not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM matches WHERE match_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Match not found" });
    res.json({ message: "Match deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
