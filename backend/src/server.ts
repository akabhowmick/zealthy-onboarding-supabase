import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configRouter } from "./routes/config.js";
import { usersRouter } from "./routes/users.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [process.env.ALLOWED_ORIGIN || "http://localhost:5173"],
  credentials: true
}));

app.get("/", (_req, res) => res.send("API OK"));
app.use("/api/config", configRouter);
app.use("/api/users", usersRouter);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
