import express from "express";
import { sign, verifyRefresh } from "../modules/jwt.js";
import { prisma } from "../models/index.js";
import CustomError from "../utils/errorHandler.js";

const router = express.Router();
//자동 로그인
router.post("/", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new CustomError(404, "토큰이 없습니다.");
    }
    //여기부터는 있다
    const token = await verifyRefresh(refreshToken);

    if (!token.userId) {
      res.status(401).end();
    }
    //유저아이디가 있다
    const user = await prisma.user.findFirst({
      where: {
        userId: token.userId,
      },
    });
    if (!user) {
      res.status(401).end();
    }
    //db에도 유저가 있다
    const accessToken = await sign(token);
    return res
      .status(200)
      .json({ message: "재발급 완료", data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

export default router;
