import CustomError from "../utils/errorHandler.js";

export class ResumeController {
  constructor(resumeService) {
    this.resumeService = resumeService;
  }
  createResume = async (req, res, next) => {
    try {
      const { title, introduce } = req.body;
      if (!title || !introduce) {
        throw new CustomError(404, "제목 또는 소개 내용은 필수값입니다.");
      }
      const { userId } = req.user;
      const createdResume = await this.resumeService.createResume(title, introduce, userId)
      return res
        .status(201)
        .json({ data: createdResume });
    } catch (err) {
      next(err);
    }
  }
  getResumes = async (req, res, next) => {

    const orderKey = req.query.orderKey ?? "resumeId";
    const orderValue = req.query.orderValue ?? "desc";
    try {
      if (!["resumeId", "status", "createdAt"].includes(orderKey)) {
        throw new CustomError(400, "orderKey가 올바르지 않습니다.");
      }
      if (!["asc", "desc"].includes(orderValue.toLowerCase())) {
        throw new CustomError(400, "orderValue가 올바르지 않습니다.");
      }
      const result = await this.resumeService.getResumesWithOrder(orderKey, orderValue)
      if (result.length === 0) {
        throw new CustomError(404, "이력서를 찾을 수 없습니다..");
      }
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }

  }
  getResumeByResumeId = async (req, res, next) => {
    const { resumeId } = req.params;
    try {
      if (!resumeId) {
        throw new CustomError(400, "resumeId는 필수값입니다.");
      }
      const resume = await this.resumeService.getResumeByResumeId(resumeId)

      if (!resume) {
        throw new CustomError(404, "이력서 조회에 실패했습니다.");
      }
      res.status(200).json({ data: resume });
    } catch (err) {
      next(err);
    }
  }
  updateResumeByResumeId = async (req, res, next) => {
    try {
      const { role, userId } = req.user;
      const { resumeId } = req.params;
      const { title, introduce } = req.body;
      if (!title || !introduce) {
        throw new CustomError(400, "요청이 잘못되었습니다.");
      }
      const resume = await this.resumeService.getResumeByResumeId(resumeId)
      console.log(resume);
      if (!resume) {
        throw new CustomError(404, "이력서를 찾을 수 없습니다.");
      }
      if (resume.userId !== userId && role === "user") {
        throw new CustomError(401, "다른 사람이 작성한 이력서입니다.");
      }
      const updatedResume = await this.resumeService.updateResumeWithResumeId(resumeId, title, introduce)
      res.status(200).json({ message: "성공적으로 수정하였습니다.", updatedResume });
    } catch (err) {
      next(err);
    }
  }
  deleteResumeById = async (req, res, next) => {
    const { resumeId } = req.params;
    const user = req.user;
    try {
      const resume = await this.resumeService.getResumeByResumeId(resumeId)
      if (!resume) {
        throw new CustomError(404, "이력서 조회에 실패했습니다.");
      }
      if (resume.userId !== user.userId) {
        throw new CustomError(401, "다른 사람이 작성한 이력서입니다.");
      }
      const deletedResume = await this.resumeService.deleteResumeByResumeId(resumeId);
      res.status(200).json({ message: "삭제 완료하였습니다.", deletedResume });
    } catch (err) {
      next(err);
    }
  }
}