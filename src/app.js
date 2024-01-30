import express from "express";
import "dotenv/config";
const app = express();
import router from "../src/routers/user.routes.js";
import { swaggerUi, specs } from "../swagger.js";
import cookieParser from "cookie-parser";
import resumeRouter from "../src/routers/resume.routes.js";

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

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT}번 포트로 서버 실행중`);
});
