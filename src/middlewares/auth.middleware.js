import { verify } from "../modules/jwt.js";
import { prisma } from "../models/index.js";

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

export const AuthJwt = async (req, res, next) => {
  const token = req.cookies.Authorization;
  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }
  const verifyUser = await verify(token);
  if (verifyUser === TOKEN_INVALID) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  if (verifyUser === TOKEN_EXPIRED) {
    return res.status(401).json({ message: "토큰이 만료되었습니다." });
  }
  if (verifyUser.userId === undefined) {
    return res
      .status(401)
      .json({ message: "사용자 정보가 일치하지 않습니다.." });
  }
  req.user = verifyUser;
  next();
};
