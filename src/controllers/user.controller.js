import CustomError from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { sign } from "../modules/jwt.js";
import { redisCli } from "../app.js"

export class UserController {
  constructor(userService) {
    this.userService = userService;
  }
  signUp = async (req, res, next) => {
    try {
      const { email, clientId, password, passwordCheck, name, role } = req.body;
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
      //해쉬
      if (!name) {
        throw new CustomError(400, "이름은 필수값입니다.");
      }
      if (clientId) {
        const user = await this.userService.findUserByClientId(clientId)
        if (user) {
          throw new CustomError(409, "이미 가입된 사용자입니다..");
        }
        await this.userService.createUserByKakao(clientId, name, role)
        return res.status(201).json({ message: "가입이 완료되었습니다." });
      } else {
        //이메일 로그인 사용자
        const user = await this.userService.findUserByEmail(email)
        if (user) {
          throw new CustomError(409, "이미 가입된 이메일입니다.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const createUser = await this.userService.createUserByEmail(email, hashedPassword, name, role)
        res.status(201).json({ data: createUser });
      }
    } catch (err) {
      next(err)
    }
  }
  login = async (req, res, next) => {
    const { email, password, clientId } = req.body;
    let user;
    try {
      if (clientId) {
        user = await this.userService.checkUserByClientId(clientId)
      } else {
        user = await this.userService.checkUserByEmail(email, password)
      }
      const jwtToken = await sign(user);
      const bearerToken = `Bearer ${jwtToken.token}`;
      const bearerRefreshToken = `Bearer ${jwtToken.refreshToken}`;
      await redisCli.set(`RefreshToken:${user.userId}`, jwtToken.refreshToken, { EX: 60 * 60 * 24 * 7 });
      res.cookie("authorization", bearerToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 12,
      });
      res.cookie("refreshToken", bearerRefreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      return res.status(201).json({ accessToken: jwtToken.token });
    } catch (err) {
      next(err);
    }
  }
  myPage = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new CustomError(400, "요청이 올바르지 않습니다.");
      }
      const user = await this.userService.findUserByUserId(userId)
      if (!user) {
        throw new CustomError(404, "사용자를 찾을 수 없습니다.");
      }
      res.status(200).json({ data: user });
    } catch (err) {
      next(err);
    }
  }
}