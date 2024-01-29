import express from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  checkExistEmail,
  checkPassword,
  checkUserEmail,
} from "../middlewares/valid.middleware.js";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { sign } from "../../modules/jwt.js";
import { AuthJwt } from "../middlewares/auth.middleware.js";
const app = express();
const router = express.Router();

router.post("/sign-up", checkExistEmail, async (req, res, next) => {
  const { email, password, passwordCheck, name } = req.body;
  console.log(password);
  if (password.length < 6) {
    return res
      .status(400)
      .json({ messsage: `비밀번호가 6자 이상이여야 합니다.` });
  }
  if (password !== passwordCheck) {
    return res
      .status(400)
      .json({ messsage: "비밀번호를 다시 한번 확인해주세요." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  const response = { ...user };
  delete response.password;
  res.status(201).json({ data: response });
});

router.post("/login", checkUserEmail, checkPassword, async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.user);
  const jwtToken = await sign(req.user);
  console.log(jwtToken);
  const bearerToken = `Bearer ${jwtToken.token}`;

  res.cookie("Authorization", bearerToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12,
  });
  return res.status(201).json({ data: jwtToken.token });
});

router.get("/myprofile", AuthJwt, async (req, res, next) => {
  console.log(req.locals.user);
  const user = req.locals.user;
  const response = { ...user };
  delete response.password;
  res.status(200).json({ data: response });
});

export default router;
