import express from "express";
import { sign, verifyRefresh } from "../modules/jwt.js";
import { prisma } from "../models/index.js";
import CustomError from "../../utils/errorHandler.js";

const router = express.Router();
//자동 로그인
router.post("/", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.RefreshToken;
    if (!refreshToken) {
      throw new CustomError(404, "토큰이 없습니다.");
    }
    const token = await verifyRefresh(refreshToken);

    if (!token.userId) {
      res.status(401).end();
    }
    const user = await prisma.user.findFirst({
      where: {
        userId: token.userId,
      },
    });
    if (!user) {
      res.status(401).end();
    }
    const accessToken = await sign(token);
    return res
      .status(200)
      .json({ message: "재발급 완료", data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

export default router;
