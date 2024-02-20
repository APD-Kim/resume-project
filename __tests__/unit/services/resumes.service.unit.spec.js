import { ResumeService } from "../../../src/services/resume.service.js"
import { expect, jest } from '@jest/globals';

let mockResumeRepository = {
  createResume: jest.fn(),
  getResumesWithOrder: jest.fn(),
  getResumeByResumeId: jest.fn(),
  updateResumeWithResumeId: jest.fn(),
  deleteResumeByResumeId: jest.fn(),
};

let resumeService = new ResumeService(mockResumeRepository)

describe('Posts Service Unit Test', () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  })

  test('createResume Method', async () => {
    const samplePost = {
      "userId": 5,
      "title": "1",
      "introduce": "소개",
      "resumeId": 7,
      "status": "APPLY",
      "createdAt": "2024-02-18T19:55:10.069Z",
      "updatedAt": "2024-02-18T19:55:10.069Z"
    }
    mockResumeRepository.createResume.mockResolvedValue(samplePost)
    const createdResume = await resumeService.createResume("1", "소개", 5);
    expect(mockResumeRepository.createResume).toHaveBeenCalledTimes(1)
    expect(createdResume).toEqual(samplePost)
    expect(mockResumeRepository.createResume).toHaveBeenCalledWith(samplePost.title, samplePost.introduce, samplePost.userId)
  })
  test('getResumesWithOrder Method', async () => {
    const sampleResumes = [
      {
        "resumeId": 2,
        "userId": 3,
        "title": "1",
        "introduce": "소개",
        "status": "APPLY",
        "createdAt": "2024-02-18T16:55:40.158Z",
        "updatedAt": "2024-02-18T16:55:40.158Z"
      },
      {
        "resumeId": 3,
        "userId": 3,
        "title": "1",
        "introduce": "소개",
        "status": "APPLY",
        "createdAt": "2024-02-18T16:41:49.492Z",
        "updatedAt": "2024-02-18T16:41:49.492Z"
      },
      {
        "resumeId": 4,
        "userId": 3,
        "title": "1",
        "introduce": "소개",
        "status": "APPLY",
        "createdAt": "2024-02-18T16:41:55.644Z",
        "updatedAt": "2024-02-18T16:41:55.644Z"
      }
    ]
    mockResumeRepository.getResumesWithOrder.mockReturnValue(sampleResumes);
    const resumes = await resumeService.getResumesWithOrder("createdAt", "desc");
    const resumesDefault = await resumeService.getResumesWithOrder();
    expect(resumes).toEqual(sampleResumes);
    expect(resumesDefault).toEqual(sampleResumes);
    expect(mockResumeRepository.getResumesWithOrder).toHaveBeenCalledTimes(2);
    expect(mockResumeRepository.getResumesWithOrder).toHaveBeenCalledWith("createdAt", "desc")


  })
  test('getResumeByResumeId method', async () => {
    const sampleResume =
    {
      "resumeId": 6,
      "userId": 3,
      "title": "1",
      "introduce": "소개",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:55:40.158Z",
      "updatedAt": "2024-02-18T16:55:40.158Z",
      user: {
        userId: 5,
        clientId: null,
        email: 'popcon9406201111@gmail.com',
        password: '$2b$10$1XfdQVliD5JUaojH1CqAnuJPpOfVCmKe3/rIOeGBPJRzOLfqwb07K',
        name: '김라임',
        createdAt: "2024-02 - 18T07: 37:02.249Z",
        updatedAt: "2024-02 - 18T07: 37:02.249Z",
        role: 'user'
      }
    }
    const resultResume = {
      "resumeId": 6,
      "userId": 3,
      "title": "1",
      "introduce": "소개",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:55:40.158Z",
      "updatedAt": "2024-02-18T16:55:40.158Z",
      name: "김라임"
    }

    mockResumeRepository.getResumeByResumeId.mockReturnValue(sampleResume)
    const resume = await resumeService.getResumeByResumeId(6)
    expect(resume).toEqual(resultResume);
    expect(mockResumeRepository.getResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeRepository.getResumeByResumeId).toHaveBeenCalledWith(6)
  })
  test('getResumeByResumeId method return null', async () => {
    const sampleResume = null;
    mockResumeRepository.getResumeByResumeId.mockReturnValue(sampleResume);
    const resume = await resumeService.getResumeByResumeId(134151)
    expect(mockResumeRepository.getResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeRepository.getResumeByResumeId).toHaveBeenCalledWith(134151)
    expect(resume).toEqual(sampleResume)
  })
  test('deleteResumeWithResumeId Method', async () => {
    const sampleResume = {
      a: 1
    }
    mockResumeRepository.deleteResumeByResumeId.mockReturnValue(sampleResume)
    const resume = await resumeService.deleteResumeByResumeId(7)
    expect(resume).toEqual(sampleResume)
    expect(mockResumeRepository.deleteResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeRepository.deleteResumeByResumeId).toHaveBeenCalledWith(7)

  })
  test('updateResumeWithResumeId Method', async () => {
    const sampleResume = {
      a: 1
    }
    mockResumeRepository.updateResumeWithResumeId.mockReturnValue(sampleResume)
    const resume = await resumeService.updateResumeWithResumeId(7, "수정제목", "수정내용")
    expect(resume).toEqual(sampleResume)
    expect(mockResumeRepository.updateResumeWithResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeRepository.updateResumeWithResumeId).toHaveBeenCalledWith(7, "수정제목", "수정내용")
  })
})