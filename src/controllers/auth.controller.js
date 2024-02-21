import { redisCli } from "../app.js";
import { sign, verifyRefresh } from "../modules/jwt.js";
import CustomError from "../utils/errorHandler.js";
export class AuthController {

  constructor(authService) {
    this.authService = authService;
  }
  autoLogin = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new CustomError(404, "토큰이 없습니다.");
      }
      //여기부터는 있다
      const verifyRefreshToken = await this.authService.verifyRefreshToken(refreshToken)
      return res
        .status(200)
        .json({ message: "재발급 완료", data: { verifyRefreshToken } });
    } catch (err) {
      next(err);
    }
  }
}