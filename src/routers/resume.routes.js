import express from "express";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { AuthJwt, AuthAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/resume", AuthJwt, async (req, res, next) => {
  const { title, introduce } = req.body;
  if (title === "" && introduce === "") {
    return res.status(400).json({ message: "요청이 잘못되었습니다." });
  }
  const user = req.locals.user;
  console.log(req.locals.user);
  try {
    const resume = await prisma.resume.create({
      data: {
        userId: user.userId, // userId 필드에 직접 user의 id를 할당
        title,
        introduce,
        author: user.name,
      },
    });
    if (!resume) {
      return res.status(404).json({ message: "이력서 조회에 실패했습니다." });
    }
    return res.status(201).json({ message: "이력서 작성이 완료되었습니다." });
  } catch {
    return res.status(500).json({ message: "서버에서 오류가 발생하였습니다." });
  }
});

router.get("/resume", async (req, res, next) => {
  const orderKey = req.query.orderKey;
  const orderValue = req.query.orderValue;
  const result = await prisma.resume.findMany({
    where: {
      userId: +orderKey,
    },
    orderBy: {
      createdAt: orderValue.toLowerCase(),
    },
  });
  if (!result) {
    return res.status(404).json({ message: "이력서 조회에 실패했습니다." });
  }
  res.status(200).json({ data: result });
});

router.get("/resume/:resumeId", async (req, res, next) => {
  const resumeId = req.params.resumeId;
  try {
    const result = await prisma.resume.findFirst({
      where: {
        resumeId: +resumeId,
      },
    });
    if (!result) {
      return res.status(404).json({ message: "이력서 조회에 실패했습니다." });
    }
    res.status(200).json({ data: result });
  } catch {
    res.status(500).json({ message: "서버에서 오류가 발생하였습니다." });
  }
});

router.patch(
  "/resume/:resumeId",
  AuthJwt,
  AuthAdmin,
  async (req, res, next) => {
    const resumeId = req.params.resumeId;
    const user = req.locals.user;
    const { title, introduce } = req.body;
    if (title === "" && introduce === "") {
      return res.status(400).json({ message: "요청이 잘못되었습니다." });
    }
    const updateData = req.body;
    try {
      const result = await prisma.resume.findFirst({
        where: {
          resumeId: +resumeId,
        },
      });
      if (!result) {
        return res.status(401).json({ message: "이력서를 찾을 수 없습니다." });
      }
      if (result.userId !== user.userId && user.role === "user") {
        return res
          .status(401)
          .json({ message: "다른사람이 작성한 이력서입니다." });
      }
      await prisma.resume.update({
        data: {
          ...updateData,
        },
        where: {
          resumeId: +resumeId,
        },
      });
      res.status(200).json({ message: "성공적으로 수정하였습니다." });
    } catch {
      res.status(500).json({ message: "서버에서 오류가 발생하였습니다." });
    }
    // res.status(200).json({ data: result });
  }
);

router.delete(
  "/resume/:resumeId",
  AuthJwt,
  AuthAdmin, //어드민임을 증명
  async (req, res, next) => {
    const resumeId = req.params.resumeId;
    const user = req.locals.user;
    try {
      const result = await prisma.resume.findFirst({
        where: {
          resumeId: +resumeId,
        },
      });
      if (!result) {
        return res
          .status(404)
          .json({ message: "이력서 조회에 실패하였습니다." });
      }
      if (result.userId !== user.userId && user.role === "user") {
        return res
          .status(401)
          .json({ message: "다른사람이 작성한 이력서입니다." });
      }
      await prisma.resume.delete({
        where: {
          resumeId: +resumeId,
        },
      });
      res.status(200).json({ message: "삭제 완료하였습니다." });
    } catch {
      res.status(500).json({ message: "서버에 에러가 발생하였습니다." });
    }
  }
);

/**
 * @swagger
 * paths:
 *  /resume:
 *    post:
 *      tags: [Resume]
 *      summary: 이력서 생성
 *
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                introduce:
 *                  type: string
 *      responses:
 *        "201":
 *          description: 이력서 작성이 완료되었습니다.
 *        "400":
 *          description: 잘못된 요청
 *
 *    get:
 *      tags: [Resume]
 *      summary: 모든 이력서 조회
 *      parameters:
 *        - in: query
 *          name: orderKey
 *          schema:
 *            type: string
 *        - in: query
 *          name: orderValue
 *          schema:
 *            type: string
 *      responses:
 *        "200":
 *          description: 이력서 조회 성공
 *        "404":
 *          description: 이력서 조회 실패
 *
 *  /resume/{resumeId}:
 *    get:
 *      tags: [Resume]
 *      summary: 특정 이력서 조회
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        "200":
 *          description: 이력서 조회 성공
 *        "404":
 *          description: 이력서 조회 실패
 *
 *    patch:
 *      tags: [Resume]
 *      summary: 이력서 수정
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                introduce:
 *                  type: string
 *      responses:
 *        "200":
 *          description: 이력서 수정 성공
 *        "400":
 *          description: 잘못된 요청
 *        "401":
 *          description: 권한 없음
 *
 *    delete:
 *      tags: [Resume]
 *      summary: 이력서 삭제
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        "200":
 *          description: 이력서 삭제 성공
 *        "404":
 *          description: 이력서 조회 실패
 *        "401":
 *          description: 권한 없음
 */

export default router;
