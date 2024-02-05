import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../models/index.js";



export const checkUserEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({
    where: { email },
  });
  console.log(user);
  req.user = user;
  if (!user) {
    return res.status(401).json({ message: "이메일을 찾을 수 없습니다." });
  } else {
    next();
  }
};

export const checkPassword = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { email },
  });
  req.user = user;
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
  }
  next();
};
