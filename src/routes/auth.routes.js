import express from "express";
import { sign, verifyRefresh } from "../modules/jwt.js";
import { prisma } from "../models/index.js";
import CustomError from "../utils/errorHandler.js";

import connectionPromise from "../models/typeorm.js"
import { getRepository } from 'typeorm';
import { UserEntity } from "../entity/User.js";

import { AuthController } from "../controllers/auth.controller.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";

const router = express.Router();
connectionPromise.then(() => {
  const userRepositoryorm = getRepository(UserEntity);
  const authRepository = new AuthRepository(userRepositoryorm)
  const authService = new AuthService(authRepository)
  const authController = new AuthController(authService)
  router.post('/', authController.autoLogin)
}).catch(error => {
  console.error("Database connection failed:", error);
  // 여기서 에러 처리 로직을 추가할 수 있습니다.
});

export default router;
