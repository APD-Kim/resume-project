import express from "express";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { AuthJwt } from "../middlewares/auth.middleware.js";

import connectionPromise from "../models/typeorm.js"
import { getRepository } from 'typeorm';
import { ResumeEntity } from "../entity/Resume.js";
import { ResumeController } from "../controllers/resume.controller.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { ResumeService } from "../services/resume.service.js";

const router = express.Router();

connectionPromise.then(() => {
  const resumeRepositoryorm = getRepository(ResumeEntity);
  const resumeRepository = new ResumeRepository(resumeRepositoryorm);
  const resumeService = new ResumeService(resumeRepository);
  const resumeController = new ResumeController(resumeService);
  router.post('/', AuthJwt, resumeController.createResume);
  router.get('/', resumeController.getResumes);
  router.get('/:resumeId', resumeController.getResumeByResumeId);
  router.patch('/:resumeId', AuthJwt, resumeController.updateResumeByResumeId);
  router.delete('/:resumeId', AuthJwt, resumeController.deleteResumeById);
}).catch(error => {
  console.error("Database connection failed:", error);
  // 여기서 에러 처리 로직을 추가할 수 있습니다.
});

export default router;
