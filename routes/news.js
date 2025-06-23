const express = require("express");
const pool = require("../db");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM news WHERE news_id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "News not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Missing required fields" });
    const publish_date = new Date();
    const result = await pool.query(
      "INSERT INTO news (title, content, author, publish_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author, publish_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;
    const result = await pool.query(
      "UPDATE news SET title = $1, content = $2, author = $3 WHERE news_id = $4 RETURNING *",
      [title, content, author, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "News not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM news WHERE news_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "News not found" });
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
