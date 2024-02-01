import express from "express";
import "dotenv/config";
import router from "../src/routers/user.routes.js";
import { swaggerUi, specs } from "../swagger.js";
import cookieParser from "cookie-parser";
import resumeRouter from "../src/routers/resume.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "redis";
const app = express();





const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(resumeRouter);
app.use(router);

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/oauth", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT}번 포트로 서버 실행중`);
});
