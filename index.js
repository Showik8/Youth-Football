const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const playerRoutes = require("./routes/players");
const clubRoutes = require("./routes/clubs");
const teamRoutes = require("./routes/teams");
const matchRoutes = require("./routes/matches");
const tournamentRoutes = require("./routes/tournaments");
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/players", playerRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
