import express from "express";
import "dotenv/config";
import { swaggerUi, specs } from "../swagger.js";
import cookieParser from "cookie-parser";
import { UserEntity } from './entity/User.js';
import { ResumeEntity } from "./entity/Resume.js";
import { dbMiddleware } from "./middlewares/typeorm.middleware.js"
import userRouter from "./routes/user.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import authRouter from "./routes/auth.routes.js";
import redis from "redis";

const redisClient = redis.createClient({
  url: `${process.env.REDIS}`,
  legacyMode: true, // 반드시 설정 !!
});
redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redisClient.connect().then();
export const redisCli = redisClient.v4;


const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(dbMiddleware)
app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use('/user', userRouter);
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
