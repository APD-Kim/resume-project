export class ResumeRepository {
  constructor(typeorm) {
    this.typeorm = typeorm;
  }
  createResume = async (title, introduce, userId) => {
    const resume = await this.typeorm.save({
      userId: Number(userId),
      title,
      introduce,
    });
    return resume;
  }
  getResumesWithOrder = async (orderKey = 'createdAt', orderValue = 'desc') => {
    const resume = await this.typeorm.createQueryBuilder("resume")
      .orderBy(orderKey, orderValue.toUpperCase())
      .getMany();
    return resume;
  }
  getResumeByResumeId = async (resumeId) => {
    const resume = await this.typeorm.findOne({
      where: {
        resumeId: Number(resumeId)
      },
      relations: ['user']
    });
    console.log(resume);
    return resume
  }
  updateResumeWithResumeId = async (resumeId, title, introduce) => {
    const updatedResume = await this.typeorm.createQueryBuilder()
      .update("resumes")
      .set({ title, introduce })
      .where({ resumeId: Number(resumeId) })
      .execute()
    return updatedResume;
  }
  deleteResumeByResumeId = async (resumeId) => {
    const deletedResume = await this.typeorm.createQueryBuilder()
      .delete("resumes")
      .where({ resumeId: Number(resumeId) })
      .execute()

    return deletedResume;
  }
}