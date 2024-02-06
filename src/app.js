import express from "express";
import "dotenv/config";
import { swaggerUi, specs } from "../swagger.js";
import cookieParser from "cookie-parser";

import userRouter from "../src/routers/user.routes.js";
import resumeRouter from "../src/routers/resume.routes.js";
import authRouter from "./routers/auth.routes.js";
const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use(userRouter);
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "서버 에러 발생";
  const boolean = err.boolean ?? false;
  res.status(statusCode).json({ success: boolean, message: message });
});
app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT}번 포트로 서버 실행중`);
});
