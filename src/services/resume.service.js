import CustomError from "../utils/errorHandler.js";

export class ResumeService {
  // postsRepository = new PostsRepository();

  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }
  createResume = async (title, introduce, userId) => {
    const createdResume = await this.resumeRepository.createResume(title, introduce, userId)

    return createdResume;
  }
  getResumesWithOrder = async (orderKey = 'createdAt', orderValue = 'desc') => {
    const resumes = await this.resumeRepository.getResumesWithOrder(orderKey, orderValue)

    return resumes;
  }
  getResumeByResumeId = async (resumeId) => {
    const resume = await this.resumeRepository.getResumeByResumeId(resumeId);
    if (!resume) {
      return null;
    }
    return {
      resumeId: resume.resumeId,
      userId: resume.userId,
      name: resume.user.name,
      title: resume.title,
      introduce: resume.introduce,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };
  }
  updateResumeWithResumeId = async (resumeId, title, introduce) => {
    const updatedResume = await this.resumeRepository.updateResumeWithResumeId(resumeId, title, introduce)

    return updatedResume;
  }
  deleteResumeByResumeId = async (resumeId) => {
    const deletedResume = await this.resumeRepository.deleteResumeByResumeId(resumeId)

    return deletedResume;
  }

}