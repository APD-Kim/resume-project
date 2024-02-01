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
const router = express.Router();

router.post("/sign-up", checkExistEmail, async (req, res, next) => {
  const { email, password, passwordCheck, name } = req.body;
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
  let emailParam = {
    toEmail: email,

    subject: "New Email From APD",

    text: `http://localhost:3000/linkValid?email=${email}&password=${hashedPassword}&name=${name}`,
  };
  mail.sendGmail(emailParam);
  return res.status(200).json({ message: "이메일 전송 완료" });
});

router.post("/easy-sign-up", checkExistEmail, async (req, res, next) => {
  const { email, password, passwordCheck, name } = req.body;
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
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  const response = { ...user };
  delete response.password;
  res.status(201).json({ data: response });
});

router.get("/linkValid", async (req, res) => {
  try {
    const { email, password, name } = req.query;
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
  } catch {
    return res.status(500).json({ message: "서버 에러 발생" });
  }
});

router.post("/login", checkUserEmail, checkPassword, async (req, res, next) => {
  const { email, password } = req.body;
  const jwtToken = await sign(req.user);
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
  try {
    const token = req.cookies.RefreshToken;
    if (!token) {
      return res.status(404).json({ message: "토큰이 없습니다." });
    }
    const verifyRefreshToken = await verify(token);
    const accessToken = await signRefresh(verifyRefreshToken);
    const bearerToken = `Bearer ${accessToken.token}`;
    res.cookie("Authorization", bearerToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 12,
    });
    return res.status(200).json({ message: "재발급 완료" });
  } catch {
    return res.status(500).json({ message: "서버 에러 발생" });
  }
});

//login 후 admin 권한 요청이기 때문에 checkPassword 필요없음.
router.post("/request-admin", AuthJwt, async (req, res, next) => {
  const { secretKey } = req.body;
  const { userId, role } = req.locals.user;
  try {
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
    const adminToken = await signAdmin(req.locals.user);
    const bearerToken = `Bearer ${adminToken.token}`;
    const cookie = res.cookie("Admin", bearerToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 12,
    });
    return res.status(200).json({ message: "관리자로 승격되었습니다." });
  } catch {
    return res.status(500).json({ message: "서버 에러 발생" });
  }
});

router.get("/myprofile", AuthJwt, async (req, res, next) => {
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

/**
 * @swagger
 * /easy-sign-up:
 *   post:
 *     tags: [User]
 *     summary: 간편 사용자 등록
 *     description: 이메일, 비밀번호, 이름을 사용하여 사용자를 등록합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordCheck
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자의 이메일
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 사용자의 비밀번호
 *               passwordCheck:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호 확인
 *               name:
 *                 type: string
 *                 description: 사용자의 이름
 *     responses:
 *       "201":
 *         description: 사용자 등록 성공
 *       "400":
 *         description: 잘못된 요청 (비밀번호 검증 실패 등)
 */

/**
 * @swagger
 * paths:
 *  /sign-up:
 *    post:
 *      tags: [User]
 *      summary: 사용자 등록(이메일)
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                passwordCheck:
 *                  type: string
 *                name:
 *                  type: string
 *      responses:
 *        "201":
 *          description: 사용자 등록 성공
 *        "400":
 *          description: 잘못된 요청
 *
 *  /login:
 *    post:
 *      tags: [User]
 *      summary: 로그인
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        "201":
 *          description: 로그인 성공
 *        "400":
 *          description: 잘못된 요청
 *
 *  /accessToken:
 *    post:
 *      tags: [User]
 *      summary: 액세스 토큰 재발급
 *      responses:
 *        "200":
 *          description: 재발급 완료
 *
 *  /request-admin:
 *    post:
 *      tags: [User]
 *      summary: 관리자 권한 요청
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                secretKey:
 *                  type: string
 *      responses:
 *        "200":
 *          description: 관리자로 승격되었습니다.
 *        "401":
 *          description: 비밀 키가 틀렸습니다.
 *
 *  /myprofile:
 *    get:
 *      tags: [User]
 *      summary: 내 프로필 정보 조회
 *      responses:
 *        "200":
 *          description: 프로필 정보 조회 성공
 *
 *  /user:
 *    delete:
 *      tags: [User]
 *      summary: 사용자 삭제
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  type: integer
 *      responses:
 *        "200":
 *          description: 사용자 삭제 성공
 *        "404":
 *          description: 해당 사용자를 찾을 수 없습니다.
 *
 *    get:
 *      tags: [User]
 *      summary: 모든 사용자 조회
 *      responses:
 *        "200":
 *          description: 사용자 목록 조회 성공
 *        "404":
 *          description: 사용자를 찾을 수 없습니다.
 */

export default router;
