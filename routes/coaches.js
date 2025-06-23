const express = require("express");
const { body, validationResult } = require("express-validator");
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

router.post(
  "/",
  authenticateAdmin,
  [
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("team_id").isInt().withMessage("Team ID must be an integer"),
    body("birth_date")
      .optional()
      .isDate()
      .withMessage("Birth date must be a valid date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { first_name, last_name, birth_date, team_id } = req.body;
      const result = await pool.query(
        "INSERT INTO coaches (first_name, last_name, birth_date, team_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [first_name, last_name, birth_date, team_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/:id",
  authenticateAdmin,
  [
    body("first_name")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("last_name")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("team_id")
      .optional()
      .isInt()
      .withMessage("Team ID must be an integer"),
    body("birth_date")
      .optional()
      .isDate()
      .withMessage("Birth date must be a valid date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { id } = req.params;
      const { first_name, last_name, birth_date, team_id } = req.body;
      const result = await pool.query(
        "UPDATE coaches SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), birth_date = COALESCE($3, birth_date), team_id = COALESCE($4, team_id) WHERE coach_id = $5 RETURNING *",
        [first_name, last_name, birth_date, team_id, id]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Coach not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

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
