// __tests__/unit/posts.controller.unit.spec.js

import { expect, jest } from '@jest/globals';
import { ResumeController } from '../../../src/controllers/resume.controller.js';
import CustomError from '../../../src/utils/errorHandler.js';

// posts.service.js 에서는 아래 5개의 Method만을 사용합니다.
const mockResumeService = {
  createResume: jest.fn(),
  getResumesWithOrder: jest.fn(),
  getResumeByResumeId: jest.fn(),
  updateResumeWithResumeId: jest.fn(),
  deleteResumeByResumeId: jest.fn(),
};

const mockRequest = {
  body: jest.fn(),
  params: jest.fn(),
  user: jest.fn()
};

const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const resumeController = new ResumeController(mockResumeService);

describe('Resume Controller Unit Test', () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });
  test('createResume Method', async () => {
    const createResumeReqBodyParams = {
      title: 'title',
      introduce: 'introduce',
    }
    mockRequest.body = createResumeReqBodyParams
    const createResumeReqUserParams = {
      userId: 1
    }
    mockRequest.user = createResumeReqUserParams
    const createdResumeReturnValue = {


      ...createResumeReqUserParams,
      ...createResumeReqBodyParams,
      resumeId: 1,
      status: "APPLY",
      createdAt: new Date().toString,
      updatedAt: new Date().toString

    }
    mockResumeService.createResume.mockReturnValue(createdResumeReturnValue)
    const createdResume = await resumeController.createResume(mockRequest, mockResponse, mockNext)
    expect(mockResumeService.createResume).toHaveBeenCalledTimes(1)
    expect(mockResumeService.createResume).toHaveBeenCalledWith(
      createResumeReqBodyParams.title,
      createResumeReqBodyParams.introduce,
      createResumeReqUserParams.userId
    )
    expect(mockResponse.status).toHaveBeenCalledWith(201)
    expect(mockResponse.json).toHaveBeenCalledWith(
      { data: createdResumeReturnValue }
    )
  });
  test('createResume Method By Invalid Body Error', async () => {
    const createResumeReqBodyParams = {
      title: 'title',
    }
    mockRequest.body = createResumeReqBodyParams;
    const createdResume = await resumeController.createResume(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(404, "제목 또는 소개 내용은 필수값입니다."))

  })
  test('getResumes Method', async () => {
    const sample = [
      {
        "resumeId": 2,
        "userId": 3,
        "title": "1",
        "introduce": "소개",
        "status": "APPLY",
        "createdAt": "2024-02-18T16:41:40.158Z",
        "updatedAt": "2024-02-18T16:41:40.158Z"
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
    ]
    const requestQueryValue = {
      orderKey: "resumeId",
      orderValue: "desc"
    }
    mockRequest.query = requestQueryValue;
    mockResumeService.getResumesWithOrder.mockReturnValue(sample);
    const resumes = await resumeController.getResumes(mockRequest, mockResponse, mockNext)

    expect(mockResumeService.getResumesWithOrder).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: sample
    })
  })
  test('getResume Method Without orderKey,orderValue', async () => {
    const sample = [
      {
        "resumeId": 2,
        "userId": 3,
        "title": "1",
        "introduce": "소개",
        "status": "APPLY",
        "createdAt": "2024-02-18T16:41:40.158Z",
        "updatedAt": "2024-02-18T16:41:40.158Z"
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
    ]
    mockResumeService.getResumesWithOrder.mockReturnValue(sample);
    const resumes = await resumeController.getResumes(mockRequest, mockResponse, mockNext)

    expect(mockResumeService.getResumesWithOrder).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: sample
    })
  })
  test('getResume Method invalid orderKey Error', async () => {
    mockRequest.query = {
      orderKey: "aaaa",
      orderValue: "desc"
    }
    const resume = await resumeController.getResumes(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "orderKey가 올바르지 않습니다."))
  })
  test('getResume Method invalid orderValue Error', async () => {
    mockRequest.query = {
      orderKey: "createdAt",
      orderValue: "aaa"
    }
    const resume = await resumeController.getResumes(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "orderValue가 올바르지 않습니다."))
  })
  test('getResume Method Not Found Resume', async () => {
    const sample = [];
    mockRequest.query = {
      orderKey: "createdAt",
      orderValue: "desc"
    }
    mockResumeService.getResumesWithOrder.mockReturnValue(sample);
    const resumes = await resumeController.getResumes(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(404, "이력서를 찾을 수 없습니다.."))
  })
  test('getResumeByResumeId Method', async () => {
    const sample = {
      "resumeId": 5,
      "userId": 5,
      "name": "김라임",
      "title": "제목",
      "introduce": "소개2",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:49:51.038Z",
      "updatedAt": "2024-02-18T17:12:44.000Z"
    }
    const requestParamsValue = {
      resumeId: 5
    }
    mockRequest.params = requestParamsValue
    mockResumeService.getResumeByResumeId.mockReturnValue(sample)
    const resume = await resumeController.getResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockResumeService.getResumeByResumeId).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: sample
    })
  })
  test('getResumeByResumeId Method invalid resumeId', async () => {
    const requestParamsValue = {
      resumeId: undefined
    }
    mockRequest.params = requestParamsValue

    const resume = await resumeController.getResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "resumeId는 필수값입니다."))
  })
  test('getResumeByResumeId Method NotFound resume', async () => {
    const sample = null
    const requestParamsValue = {
      resumeId: 5
    }
    mockRequest.params = requestParamsValue
    mockResumeService.getResumeByResumeId.mockReturnValue(sample)
    const resume = await resumeController.getResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(404, "이력서 조회에 실패했습니다."))
  })
  test('updateResumeByResumeId Method invalid body', async () => {
    const sampleResume = null;
    mockRequest.body = {
      introduce: "소개2수정"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sampleResume)
    const findResume = await resumeController.updateResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "요청이 잘못되었습니다."))
  })
  test('updateResumeByResumeId Method Not Found resume', async () => {
    const sample = null
    mockRequest.body = {
      title: "제목수정",
      introduce: "소개2수정"
    }
    const requestParamsValue = {
      resumeId: 5
    }
    mockRequest.user = {
      userId: 5,
      role: "admin"
    }
    mockRequest.params = requestParamsValue
    mockResumeService.getResumeByResumeId.mockReturnValue(sample)
    const resume = await resumeController.updateResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(404, "이력서를 찾을 수 없습니다."))

  })
  test('updateResumeByResumeId Method invalid user', async () => {
    const sampleBeforeUpdate = {
      "resumeId": 5,
      "userId": 5,
      "name": "김라임",
      "title": "제목",
      "introduce": "소개2",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:49:51.038Z",
      "updatedAt": "2024-02-18T17:12:44.000Z"
    }
    mockRequest.body = {
      title: "제목수정",
      introduce: "소개2수정"
    }
    mockRequest.params = {
      resumeId: 5
    }
    mockRequest.user = {
      userId: 6,
      role: "user"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sampleBeforeUpdate)
    const resume = await resumeController.updateResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(401, "다른 사람이 작성한 이력서입니다."))
  })
  test('deleteResumeByResumeId Method Not Found resume', async () => {
    const sampleBeforeUpdate = null
    mockRequest.params = {
      resumeId: 1
    }
    mockRequest.user = {
      userId: 6,
      role: "user"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sampleBeforeUpdate)
    const resume = await resumeController.deleteResumeById(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(404, "이력서 조회에 실패했습니다."))
  })
  test('deleteResumeByResumeId Method invalid delete', async () => {
    const sample = {
      "resumeId": 5,
      "userId": 5,
      "name": "김라임",
      "title": "제목",
      "introduce": "소개2",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:49:51.038Z",
      "updatedAt": "2024-02-18T17:12:44.000Z"
    }
    mockRequest.params = {
      resumeId: 1
    }
    mockRequest.user = {
      userId: 6,
      role: "user"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sample)
    const resume = await resumeController.deleteResumeById(mockRequest, mockResponse, mockNext)
    expect(mockNext).toHaveBeenCalledWith(new CustomError(401, "다른 사람이 작성한 이력서입니다."))
  })
  test('updateResumeByResumeId Method', async () => {
    const sampleBeforeUpdate = {
      "resumeId": 5,
      "userId": 5,
      "name": "김라임",
      "title": "제목",
      "introduce": "소개2",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:49:51.038Z",
      "updatedAt": "2024-02-18T17:12:44.000Z"
    }
    mockRequest.body = {
      title: "제목수정",
      introduce: "소개2수정"
    }
    mockRequest.params = {
      resumeId: 5
    }
    mockRequest.user = {
      userId: 5,
      role: "admin"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sampleBeforeUpdate)
    mockResumeService.updateResumeWithResumeId.mockResolvedValue({ affected: 1 })
    const findResume = await resumeController.updateResumeByResumeId(mockRequest, mockResponse, mockNext)
    expect(mockResumeService.getResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeService.updateResumeWithResumeId).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "성공적으로 수정하였습니다.",
      updatedResume: { affected: 1 }
    })
  })
  test('deleteResumeById Method', async () => {
    const sampleBeforeDelete = {
      "resumeId": 5,
      "userId": 5,
      "name": "김라임",
      "title": "제목",
      "introduce": "소개2",
      "status": "APPLY",
      "createdAt": "2024-02-18T16:49:51.038Z",
      "updatedAt": "2024-02-18T17:12:44.000Z"
    }
    mockRequest.params = {
      resumeId: 5
    }
    mockRequest.user = {
      userId: 5,
      role: "admin"
    }
    mockResumeService.getResumeByResumeId.mockReturnValue(sampleBeforeDelete)
    mockResumeService.deleteResumeByResumeId.mockResolvedValue({ affected: 1 })
    const findResume = await resumeController.deleteResumeById(mockRequest, mockResponse, mockNext)
    expect(mockResumeService.getResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResumeService.deleteResumeByResumeId).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledTimes(1)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "삭제 완료하였습니다.",
      deletedResume: { affected: 1 }
    })
  })


});