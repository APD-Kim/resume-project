
import { getRepository } from 'typeorm';
import { UserEntity } from '../entity/User.js';
import { ResumeEntity } from "../entity/Resume.js";


export const dbMiddleware = function (req, res, next) {
  req.userRepository = getRepository(UserEntity);
  req.resumeRepository = getRepository(ResumeEntity);
  next();
}

