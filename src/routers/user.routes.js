import express from "express";
import bcrypt from "bcrypt";
import {
  checkPassword,
  checkUserEmail,
} from "../middlewares/valid.middleware.js";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { sign, signAdmin, verify } from "../modules/jwt.js";
import { AuthJwt } from "../middlewares/auth.middleware.js";
import mail from "../modules/nodemailer.js";
import CustomError from "../../utils/errorHandler.js";
const router = express.Router();

router.post("/sign-up", async (req, res, next) => {
  const { email, clientId, password, passwordCheck, name, role } = req.body;
  try {
    if (role && !["user", "admin"].includes(role)) {
      throw new CustomError(400, "등급이 올바르지 않습니다.");
    }
    if (!clientId) {
      if (!email) {
        throw new CustomError(400, "이메일은 필수값입니다.");
      }
      if (!password) {
        throw new CustomError(400, "비밀번호는 필수값입니다.");
      }
      if (!passwordCheck) {
        throw new CustomError(400, "비밀번호 확인은 필수값입니다.");
      }
      if (password.length < 6) {
        throw new CustomError(400, "비밀번호가 6글자 이상이여야 합니다.");
      }
      if (password !== passwordCheck) {
        throw new CustomError(400, "비밀번호를 다시 한번 확인해주세요.");
      }
    }
    if (!name) {
      throw new CustomError(400, "이름은 필수값입니다.");
    }

    //카카오 로그인 사용자
    if (clientId) {
      const user = await prisma.user.findFirst({
        where: {
          clientId,
        },
      });
      if (user) {
        throw new CustomError(400, "이미 가입된 사용자입니다..");
      }
      await prisma.user.create({
        data: {
          clientId,
          name,
          role,
        },
      });
      return res.status(201).json({ message: "가입이 완료되었습니다." });
    } else {
      //이메일 로그인 사용자
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (user) {
        throw new CustomError(400, "이미 가입된 이메일입니다.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      let emailParam = {
        toEmail: email,

        subject: "New Email From APD",

        text: `http://localhost:3000/valid?email=${email}&password=${hashedPassword}&name=${name}`,
      };
      mail.sendGmail(emailParam);
    }

    return res.status(200).json({ message: "이메일 전송 완료" });
  } catch (error) {
    next(error);
  }
});

router.get("/valid", async (req, res) => {
  try {
    const { email, password, name, role } = req.query;
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role,
      },
    });
    const { password: userPassword, ...response } = user;
    res.status(201).json({ data: response });
  } catch (error) {
    next(error);
  }
});
//사용자 로그인
router.post("/login", async (req, res, next) => {
  const { email, password, clientId } = req.body;
  let user;
  try {
    if (clientId) {
      user = await prisma.user.findFirst({
        where: {
          clientId,
        },
      });
      if (!user) {
        throw new CustomError(400, "올바르지 않은 로그인 정보입니다.");
      }
    } else {
      if (!email) {
        throw new CustomError(400, "이메일은 필수값입니다.");
      }
      if (!password) {
        throw new CustomError(400, "비밀번호는 필수값입니다.");
      }
      user = await prisma.user.findFirst({
        where: { email },
      });
      if (!user) {
        throw new CustomError(400, "이메일이 올바르지 않습니다.");
      }
      const comparePassword = await bcrypt.compare(password, user.password);
      console.log(comparePassword);
      if (!comparePassword) {
        throw new CustomError(400, "비밀번호가 틀렸습니다.");
      }
    }
    const jwtToken = await sign(user);
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
    return res.status(201).json({ accessToken: jwtToken.token });
  } catch (err) {
    next(err);
  }
});

router.get("/user/me", AuthJwt, async (req, res, next) => {
  const userId = req.user.userId;
  try {
    if (!userId) {
      throw new CustomError(400, "요청이 올바르지 않습니다.");
    }
    const user = await prisma.user.findFirst({
      where: {
        userId: +userId,
      },
      select: {
        clientId: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new CustomError(404, "사용자를 찾을 수 없습니다.");
    }
    const response = { ...user };
    delete response.password;
    res.status(200).json({ data: response });
  } catch (err) {
    next(err);
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
