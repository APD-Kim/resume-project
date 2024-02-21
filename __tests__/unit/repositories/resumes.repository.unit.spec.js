import { describe, expect, jest } from '@jest/globals';
import { ResumeRepository } from '../../../src/repositories/resume.repository.js';

const mockTypeorm = {

  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),

};

const resumeRepository = new ResumeRepository(mockTypeorm);

describe('Resume Repo Unit Test', () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  })

  test('save method', async () => {
    const MockReturn = 'save Resume Return String'
    mockTypeorm.save.mockReturnValue(MockReturn)
    const createParams = {
      userId: 1,
      title: "createResumeTitle",
      introduce: "createResumeIntroduce",
    }
    const createResumeData = await resumeRepository.createResume(
      createParams.title,
      createParams.introduce,
      createParams.userId
    )
    expect(createResumeData).toEqual(MockReturn)
    expect(mockTypeorm.save).toHaveBeenCalledTimes(1)
    expect(mockTypeorm.save).toHaveBeenCalledWith({
      title: createParams.title,
      introduce: createParams.introduce,
      userId: createParams.userId
    })
  })
  test('getResumesWithOrder Method without arguments', async () => {
    const mockReturn = "Resmues String"
    mockTypeorm.createQueryBuilder = jest.fn().mockReturnThis();
    mockTypeorm.orderBy = jest.fn().mockReturnThis();
    //mockReturnThis는 this를 호출하여 다음 메서드를 호출하는 결과를 가짐(지속적으로 메서드 체이닝을 함)
    mockTypeorm.getMany = jest.fn().mockResolvedValue(mockReturn);
    const resumes = await resumeRepository.getResumesWithOrder()
    expect(mockTypeorm.createQueryBuilder).toHaveBeenCalledTimes(1)
    expect(mockTypeorm.orderBy).toHaveBeenCalledTimes(1)
    expect(mockTypeorm.orderBy).toHaveBeenCalledWith("createdAt", "DESC")
    expect(mockTypeorm.getMany).toHaveBeenCalledTimes(1)
    expect(resumes).toEqual(mockReturn)
  })
  test('getResumeByResumeId Method', async () => {
    const mockReturn = "Resmue String"
    const resumeId = 1
    mockTypeorm.findOne.mockReturnValue(mockReturn)
    const resume = await resumeRepository.getResumeByResumeId(resumeId)
    expect(mockTypeorm.findOne).toHaveBeenCalledTimes(1)
    expect(mockTypeorm.findOne).toHaveBeenCalledWith({
      relations: ["user"],
      where: {
        resumeId
      }
    })
    expect(resume).toEqual(mockReturn)
  })
  test('updateResumeWithResumeId Method', async () => {
    const mockReturn = "Resmue String"
    const updateParams = {
      resumeId: 1,
      title: "update Resume Titile",
      introduce: "update Resume Introduce"
    }
    mockTypeorm.createQueryBuilder = jest.fn().mockReturnThis();
    mockTypeorm.update = jest.fn().mockReturnThis();
    mockTypeorm.set = jest.fn().mockReturnThis()
    mockTypeorm.where = jest.fn().mockReturnThis()
    //mockReturnThis는 this를 호출하여 다음 메서드를 호출하는 결과를 가짐(지속적으로 메서드 체이닝을 함)
    mockTypeorm.execute = jest.fn().mockResolvedValue(mockReturn);
    const resume = await resumeRepository.updateResumeWithResumeId(updateParams.resumeId, updateParams.title, updateParams.introduce)
    expect(mockTypeorm.update).toHaveBeenCalledWith("resumes")
    expect(mockTypeorm.set).toHaveBeenCalledWith({ title: updateParams.title, introduce: updateParams.introduce })
    expect(mockTypeorm.where).toHaveBeenCalledWith({ resumeId: updateParams.resumeId })
    expect(mockTypeorm.execute).toHaveBeenCalledTimes(1)
    expect(resume).toEqual(mockReturn)
  })
  test('deleteResumeByResumeId Method', async () => {
    const mockReturn = "Resmue String"
    const updateParams = {
      resumeId: 1,
    }
    mockTypeorm.createQueryBuilder = jest.fn().mockReturnThis();
    mockTypeorm.delete = jest.fn().mockReturnThis();
    mockTypeorm.where = jest.fn().mockReturnThis();
    mockTypeorm.execute = jest.fn().mockResolvedValue(mockReturn);
    const resume = await resumeRepository.deleteResumeByResumeId(updateParams.resumeId);
    expect(mockTypeorm.delete).toHaveBeenCalledWith("resumes");
    expect(mockTypeorm.where).toHaveBeenCalledWith({ resumeId: updateParams.resumeId });
    expect(mockTypeorm.execute).toHaveBeenCalledTimes(1);
    expect(resume).toEqual(mockReturn)
  })

})