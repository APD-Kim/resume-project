import bcrypt from "bcrypt";
import CustomError from "../utils/errorHandler.js";
export class UserService {

  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  findUserByClientId = async (clientId) => {
    const user = await this.userRepository.findUserByClientId(clientId);

    return {
      userId: user.userId,
      clientId: user.clientId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
  }
  findUserByEmail = async (email) => {
    const user = await this.userRepository.findUserByEmail(email);

    return user ? {
      userId: user.userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    } : null
  }
  findUserByUserId = async (userId) => {
    const user = await this.userRepository.findUserByUserId(userId);

    return {
      clientId: user.clientId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
  }

  createUserByKakao = async (clientId, name, role) => {
    const user = await this.userRepository.createUserByKakao(clientId, name, role);

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
  }
  createUserByEmail = async (email, password, name, role) => {
    const user = await this.userRepository.createUserByEmail(email, password, name, role);

    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
  }
  checkUserByClientId = async (clientId) => {
    user = await this.userService.findUserByClientId(clientId)
    if (!user) {
      throw new CustomError(400, "올바르지 않은 로그인 정보입니다.");
    }
  }
  checkUserByEmail = async (email, password) => {
    if (!email) {
      throw new CustomError(400, "이메일은 필수값입니다.");
    }
    if (!password) {
      throw new CustomError(400, "비밀번호는 필수값입니다.");
    }

    const user = await this.userRepository.findUserByEmail(email);
    console.log(user);
    if (!user) {
      throw new CustomError(401, '사용자를 찾을 수 없습니다.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CustomError(401, '비밀번호가 잘못되었습니다.');
    }


    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
    };
  }
}
