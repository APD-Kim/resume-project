import express from "express";
import { sign, verifyRefresh } from "../modules/jwt.js";
import { prisma } from "../models/index.js";
import CustomError from "../utils/errorHandler.js";

import { AuthController } from "../controllers/auth.controller.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";
const authRepository = new AuthRepository(prisma)
const authService = new AuthService(authRepository)
const authController = new AuthController(authService)

const router = express.Router();

router.post('/', authController.autoLogin)

export default router;
