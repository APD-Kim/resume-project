import express from "express";
import { prisma } from "../models/index.js";
import { AuthJwt } from "../middlewares/auth.middleware.js";
import "dotenv/config";

import connectionPromise from "../models/typeorm.js"
import { getRepository } from 'typeorm';
import { UserEntity } from "../entity/User.js";
import { UserController } from "../controllers/user.controller.js";
import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.service.js";
import { apiTimeCheck } from "../middlewares/api-titme-check.js";

const router = express.Router();
connectionPromise.then(() => {
  const userRepositoryorm = getRepository(UserEntity);
  const userRepository = new UserRepository(userRepositoryorm);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  router.post('/sign-up', userController.signUp);
  router.post('/login', userController.login);
  router.get("/mypage", AuthJwt, userController.myPage);
}).catch(error => {
  console.error("Database connection failed:", error);
  // 여기서 에러 처리 로직을 추가할 수 있습니다.
});




export default router;
