import { redisCli } from "../app.js";
import { sign, verifyRefresh } from "../modules/jwt.js";
import CustomError from "../utils/errorHandler.js";

export class AuthService {
  // postsRepository = new PostsRepository();

  constructor(authRepository) {
    this.authRepository = authRepository;
  }
  verifyRefreshToken = async (refreshToken) => {
    const token = await verifyRefresh(refreshToken);
    const [tokenType, tokenValue] = refreshToken.split(" ")

    if (tokenType !== "Bearer") {
      throw new CustomError(401, '토큰 형식이 올바르지 않습니다.')
    }
    const redis = await redisCli.get(`RefreshToken:${token.userId}`)

    if (!redis || tokenValue !== redis) {
      throw new CustomError(401, '토큰 정보가 올바르지 않습니다.')
    }

    const user = await this.authRepository.findUserByUserId(token.userId)
    if (!user) {
      throw new CustomError(401, '토큰 정보가 올바르지 않습니다.')
    }
    //db에도 유저가 있다
    const accessToken = await sign(token);
    return accessToken;
  }
}