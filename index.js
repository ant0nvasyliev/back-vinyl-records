require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const cors = require("cors");

require("./db");

const vinylRouter = require("./routes/vinyl");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

const app = express();

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});

app.use("/avatars", express.static("public/avatars"));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

const authMiddleware = require("./middleware/authMiddleware");

app.use("/vinyls", authMiddleware, vinylRouter);
app.use("/users", authRouter);
app.use("/users", authMiddleware, userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
