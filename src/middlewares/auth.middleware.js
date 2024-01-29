import { verify } from "../../modules/jwt.js";
import { prisma } from "../models/index.js";

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

export const AuthJwt = async (req, res, next) => {
  console.log(req.headers.cookie);

  const token = req.headers.cookie;
  req.locals = {};
  const verifyUser = await verify(token);
  if (verifyUser === TOKEN_INVALID) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  if (verifyUser.userId === undefined) {
    return res
      .status(401)
      .json({ message: "사용자 정보가 일치하지 않습니다.." });
  }
  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }
  if (verifyUser === TOKEN_EXPIRED) {
    return res.status(401).json({ message: "토큰이 만료되었습니다." });
  }
  req.locals.user = await prisma.user.findFirst({
    where: { userId: +verifyUser.userId },
  });
  req.headers.authorization = req.cookies.Authorization;
  console.log(req.locals.user);
  next();
};
// 인증 필요 API 호출 시 Request Header의 Authorization 값으로 JWT를 함께 넘겨줘야 합니다.
