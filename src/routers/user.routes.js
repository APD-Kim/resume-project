import express from "express";
import bcrypt from "bcrypt";
import {
  checkExistEmail,
  checkPassword,
  checkUserEmail,
} from "../middlewares/valid.middleware.js";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { sign, signAdmin, verify, signRefresh } from "../../modules/jwt.js";
import { AuthJwt } from "../middlewares/auth.middleware.js";
import mail from "../../modules/nodemailer.js";
import client from "../../config/redis.js";
const router = express.Router();

router.post("/sign-up", checkExistEmail, async (req, res, next) => {
  const { email, password, passwordCheck, name } = req.body;
  console.log(password);
  const hashedPassword = await bcrypt.hash(password, 10);
  if (password.length < 6) {
    return res
      .status(400)
      .json({ messsage: `비밀번호가 6자 이상이여야 합니다.` });
  }
  if (password !== passwordCheck) {
    return res
      .status(400)
      .json({ messsage: "비밀번호를 다시 한번 확인해주세요." });
  }
  //일단 db에 박고
  //인증여부 컬럼을 만들어서
  //
  let emailParam = {
    toEmail: email, // 수신할 이메일

    subject: "New Email From APD", // 메일 제목

    text: `http://localhost:3000/linkValid?email=${email}&password=${hashedPassword}&name=${name}`, // 메일 내용
  };
  client.set()
  mail.sendGmail(emailParam);
  return res.status(200).json({ message: "이메일 전송 완료" });
});

router.get("/linkValid", async (req, res) => {
  const validNum = req.body

  const { email, password, name } = req.query;
  console.log(email);
  const user = await prisma.user.create({
    data: {
      email,
      password,
      name,
    },
  });
  const response = { ...user };
  delete response.password;
  res.status(201).json({ data: response });
});

router.post("/login", checkUserEmail, checkPassword, async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.user);
  const jwtToken = await sign(req.user);
  console.log(jwtToken);
  const bearerToken = `Bearer ${jwtToken.token}`;
  const bearerRefreshToken = `Bearer ${jwtToken.refreshToken}`;

  res.cookie("Authorization", bearerToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12,
  });
  res.cookie("RefreshToken", bearerRefreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.status(201).json({ data: jwtToken.token });
});

router.post("/accessToken", async (req, res, next) => {
  const token = req.cookies.RefreshToken; //리프레시 토큰을 token변수에 저장
  console.log(token);
  const verifyRefreshToken = await verify(token); //리프레시 토큰을 verify하고 payload 데이터를 받아온다
  console.log(verifyRefreshToken);
  const accessToken = await signRefresh(verifyRefreshToken);
  console.log(accessToken);
  const bearerToken = `Bearer ${accessToken.token}`;
  res.cookie("Authorization", bearerToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12,
  });
  return res.status(200).json({ message: "재발급 완료" });
});

//login 후 admin 권한 요청이기 때문에 checkPassword 필요없음.
router.post("/request-admin", AuthJwt, async (req, res, next) => {
  const { secretKey } = req.body;
  const { userId, role } = req.locals.user;
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ message: "비밀 키가 틀렸습니다." });
  }
  if (role !== "admin") {
    const result = await prisma.user.update({
      where: {
        userId: +userId,
      },
      data: {
        role: "admin",
      },
    });
  }
  console.log(name);
  const adminToken = await signAdmin(req.locals.user);
  console.log(adminToken);
  const bearerToken = `Bearer ${adminToken.token}`;

  const cookie = res.cookie("Admin", bearerToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12,
  });
  console.log(cookie);
  return res.status(200).json({ message: "관리자로 승격되었습니다." });
});

router.get("/myprofile", AuthJwt, async (req, res, next) => {
  console.log(req.locals.user.userId);
  const user = req.locals.user;
  const response = { ...user };
  delete response.password;
  res.status(200).json({ data: response });
});

router.delete("/user", async (req, res, next) => {
  const { userId } = req.body;
  const find = await prisma.user.findFirst({
    where: {
      userId: +userId,
    },
  });
  if (!find) {
    return res.status(404).json({ message: "해당 유저를 찾을 수 없습니다." });
  }
  const user = await prisma.user.delete({
    where: {
      userId: +userId,
    },
  });
  console.log(user);
  if (user) {
    return res
      .status(200)
      .json({ message: `성공적으로 ${user.email}를 삭제했습니다.` });
  }
});

router.get("/user", async (req, res, next) => {
  const { userId } = req.body;
  const find = await prisma.user.findMany({});
  if (!find) {
    return res.status(404).json({ message: "해당 유저를 찾을 수 없습니다." });
  }
  if (find) {
    return res.status(200).json({ data: find });
  }
});

/* GET sign in page. */
/**
 * @swagger
 * paths:
 *  /sign-up:
 *   post:
 *     tags: [User]
 *     summary: 사용자 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordCheck:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       "201":
 *         description: 사용자 등록 성공
 *       "400":
 *         description: 잘못된 요청
 *
 *  /login:
 *   post:
 *     tags: [User]
 *     summary: 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       "201":
 *         description: 로그인 성공
 *       "400":
 *         description: 잘못된 요청
 *  /accessToken:
 *     post:
 *       tags: [User]
 *     summary: 액세스 토큰 재발급
 *    responses:
 *         "200":
 *         description: 재발급 완료
 *
 *  /myprofile:
 *   get:
 *     tags: [User]
 *     summary: 내 프로필 정보
 *     responses:
 *       "200":
 *         description: 프로필 정보 조회 성공
 */

export default router;
