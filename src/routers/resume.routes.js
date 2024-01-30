import express from "express";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { AuthJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/resume", AuthJwt, async (req, res, next) => {
  const { title, introduce } = req.body;
  const user = req.locals.user;
  console.log(req.locals.user);
  const resume = await prisma.resume.create({
    data: {
      userId: user.userId, // userId 필드에 직접 user의 id를 할당
      title,
      introduce,
      author: user.name,
    },
  });
  res.status(201).json({ message: "이력서 작성이 완료되었습니다." });
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
  res.status(200).json({ data: result });
});

router.get("/resume/:resumeId", async (req, res, next) => {
  const resumeId = req.params.resumeId;
  const result = await prisma.resume.findFirst({
    where: {
      resumeId: +resumeId,
    },
  });
  res.status(200).json({ data: result });
});

router.patch("/resume/:resumeId", AuthJwt, async (req, res, next) => {
  const resumeId = req.params.resumeId;
  const user = req.locals.user;
  const updateData = req.body;
  const result = await prisma.resume.findFirst({
    where: {
      resumeId: +resumeId,
    },
  });
  if (!result) {
    return res.status(401).json({ message: "이력서를 찾을 수 없습니다." });
  }
  if (result.userId !== user.userId) {
    return res.status(401).json({ message: "다른사람이 작성한 이력서입니다." });
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
  // res.status(200).json({ data: result });
});

router.delete("/resume/:resumeId", AuthJwt, async (req, res, next) => {
  const resumeId = req.params.resumeId;
  const user = req.locals.user;
  const result = await prisma.resume.findFirst({
    where: {
      resumeId: +resumeId,
    },
  });
  if (!result) {
    return res.status(401).json({ message: "이력서 조회에 실패하였습니다." });
  }
  if (result.userId !== user.userId) {
    return res.status(401).json({ message: "다른사람이 작성한 이력서입니다." });
  }
  await prisma.resume.delete({
    where: {
      resumeId: +resumeId,
    },
  });
  res.status(200).json({ message: "삭제 완료하였습니다." });
});

/**
 * @swagger
 * paths:
 *  /resume:
 *    post:
 *      tags: [Resume]
 *      summary: Create a new resume
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - title
 *                - introduce
 *              properties:
 *                title:
 *                  type: string
 *                introduce:
 *                  type: string
 *      responses:
 *        "201":
 *          description: Resume created successfully
 *    get:
 *      tags: [Resume]
 *      summary: Get all resumes
 *      parameters:
 *        - in: query
 *          name: orderKey
 *          schema:
 *            type: integer
 *          required: true
 *          description: Order key for sorting
 *        - in: query
 *          name: orderValue
 *          schema:
 *            type: string
 *          required: true
 *          description: Order value for sorting (asc or desc)
 *      responses:
 *        "200":
 *          description: A list of resumes
 *  /resume/{resumeId}:
 *    get:
 *      tags: [Resume]
 *      summary: Get a specific resume by its ID
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Unique ID of the resume
 *      responses:
 *        "200":
 *          description: Resume details
 *    patch:
 *      tags: [Resume]
 *      summary: Update a specific resume
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Unique ID of the resume
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        "200":
 *          description: Resume updated successfully
 *    delete:
 *      tags: [Resume]
 *      summary: Delete a specific resume
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: resumeId
 *          required: true
 *          schema:
 *            type: integer
 *          description: Unique ID of the resume
 *      responses:
 *        "200":
 *          description: Resume deleted successfully
 *
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 */
export default router;
