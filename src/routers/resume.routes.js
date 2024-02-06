import express from "express";
import { prisma } from "../models/index.js";
import "dotenv/config";
import { AuthJwt } from "../middlewares/auth.middleware.js";
import CustomError from "../../utils/errorHandler.js";

const router = express.Router();
//이력서 생성
router.post("/resume", AuthJwt, async (req, res, next) => {
  const { title, introduce } = req.body;
  const user = req.user;
  try {
    if (!title || !introduce) {
      throw new CustomError(404, "제목 또는 소개 내용은 필수값입니다.");
    }
    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        title,
        introduce,
      },
    });
    return res
      .status(201)
      .json({ message: "이력서 작성이 완료되었습니다.", resume });
  } catch (err) {
    next(err);
  }
});
//이력서 조회
router.get("/resume", async (req, res, next) => {
  const orderKey = req.query.orderKey ?? "resumeId";
  const orderValue = req.query.orderValue ?? "desc";
  try {
    if (!["resumeId", "status", "createdAt"].includes(orderKey)) {
      throw new CustomError(400, "orderKey가 올바르지 않습니다.");
    }
    if (!["asc", "desc"].includes(orderValue.toLowerCase())) {
      throw new CustomError(400, "orderValue가 올바르지 않습니다.");
    }
    const result = await prisma.resume.findMany({
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        status: true,
        User: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        [orderKey]: orderValue.toLowerCase(),
      },
    });
    if (result.length === 0) {
      throw new CustomError(404, "이력서를 찾을 수 없습니다..");
    }
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
});
//이력서 상세 조회
router.get("/resume/:resumeId", async (req, res, next) => {
  const resumeId = req.params.resumeId;
  try {
    if (!resumeId) {
      throw new CustomError(400, "resumeId는 필수값입니다.");
    }
    const resume = await prisma.resume.findUnique({
      where: {
        resumeId: Number(resumeId),
      },
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        status: true,
        User: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });
    if (!resume) {
      throw new CustomError(404, "이력서 조회에 실패했습니다.");
    }
    res.status(200).json({ data: resume });
  } catch (err) {
    next(err);
  }
});

router.patch("/resume/:resumeId", AuthJwt, async (req, res, next) => {
  const resumeId = req.params.resumeId;
  const user = req.user;
  const { title, introduce } = req.body;
  try {
    if (title === "" && introduce === "") {
      throw new CustomError(400, "요청이 잘못되었습니다.");
    }
    const updateData = req.body;
    const result = await prisma.resume.findFirst({
      where: {
        resumeId: +resumeId,
      },
    });
    if (!result) {
      throw new CustomError(404, "이력서를 찾을 수 없습니다.");
    }
    if (result.userId !== user.userId && user.role === "user") {
      throw new CustomError(401, "다른 사람이 작성한 이력서입니다.");
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
  } catch (err) {
    next(err);
  }
  // res.status(200).json({ data: result });
});

router.delete(
  "/resume/:resumeId",
  AuthJwt, //어드민임을 증명
  async (req, res, next) => {
    const resumeId = req.params.resumeId;
    const user = req.user;
    try {
      const result = await prisma.resume.findFirst({
        where: {
          resumeId: +resumeId,
        },
      });
      if (!result) {
        throw new CustomError(404, "이력서 조회에 실패했습니다.");
      }
      if (result.userId !== user.userId) {
        throw new CustomError(401, "다른 사람이 작성한 이력서입니다.");
      }
      await prisma.resume.delete({
        where: {
          resumeId: +resumeId,
        },
      });
      res.status(200).json({ message: "삭제 완료하였습니다." });
    } catch (err) {
      next(err);
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
