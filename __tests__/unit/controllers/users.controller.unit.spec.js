import { expect, jest } from '@jest/globals';
import { UserController } from '../../../src/controllers/user.controller.js';
import CustomError from '../../../src/utils/errorHandler.js';

const mockUserService = {
  findUserByClientId: jest.fn(),
  createUserByKakao: jest.fn(),
  findUserByEmail: jest.fn(),
  createUserByEmail: jest.fn(),
  checkUserByClientId: jest.fn(),
  checkUserByEmail: jest.fn(),
  findUserByUserId: jest.fn(),
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

const userController = new UserController(mockUserService);

describe('User Controller Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });
  test('signUp Method With ClientId ', async () => {
    const mockReturn = "singup complete"
    const paramsValue = {
      clientId: 1,
      name: "김라임",
      role: "user",
    }
    mockRequest.body = paramsValue;
    mockUserService.findUserByClientId.mockReturnValue(null)
    mockUserService.createUserByKakao.mockReturnValue(mockReturn)
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockUserService.findUserByClientId).toHaveBeenCalledTimes(1)
    expect(mockUserService.createUserByKakao).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(201)
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "가입이 완료되었습니다." })

  })

  test('signUp Method invalid role ', async () => {
    mockRequest.body = {
      role: "citizen"
    }
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "등급이 올바르지 않습니다."))
  })
  test('signUp Method With Email ', async () => {
    const mockReturn = "singup complete"
    const paramsValue = {
      email: "popcon940620@gmail.com",
      name: "김라임",
      role: "user",
      password: "123456",
      passwordCheck: "123456",

    }
    mockRequest.body = paramsValue;
    mockUserService.findUserByEmail.mockReturnValue(null)
    mockUserService.createUserByEmail.mockReturnValue(mockReturn)
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockUserService.findUserByEmail).toHaveBeenCalledTimes(1)
    expect(mockUserService.createUserByEmail).toHaveBeenCalledTimes(1)
    expect(mockResponse.status).toHaveBeenCalledWith(201)
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockReturn })
  })
  test('signUp Method With Email ', async () => {
    mockRequest.body = {
      role: "user"
    }
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "이메일은 필수값입니다."))
  })
  test('signUp Method invalid Email ', async () => {
    mockRequest.body = {
      role: "user",
      email: "popcon940620@gmail.com"
    }
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "비밀번호는 필수값입니다."))
  })
  test('signUp Method invalid password ', async () => {
    mockRequest.body = {
      role: "user",
      email: "popcon940620@gmail.com",
      password: "1234"
    }
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "비밀번호 확인은 필수값입니다."))
  })
  test('signUp Method invalid passwordCheck ', async () => {
    mockRequest.body = {
      role: "user",
      email: "popcon940620@gmail.com",
      password: "1234",
      passwordCheck: "1234"
    }
    const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "비밀번호가 6글자 이상이여야 합니다."))
  })
})
test('signUp Method invalid password less than 6 ', async () => {
  mockRequest.body = {
    role: "user",
    email: "popcon940620@gmail.com",
    password: "123455",
    passwordCheck: "123456"
  }
  const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
  expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "비밀번호를 다시 한번 확인해주세요."))
})
test('signUp Method invalid Compare Password ', async () => {
  mockRequest.body = {
    role: "user",
    email: "popcon940620@gmail.com",
    password: "123456",
    passwordCheck: "123456"

  }
  const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
  expect(mockNext).toHaveBeenCalledWith(new CustomError(400, "이름은 필수값입니다."))
})
test('signUp Method invalid name ', async () => {
  mockRequest.body = {
    clientId: 1,
    role: "user",
    email: "popcon940620@gmail.com",
    password: "123456",
    passwordCheck: "123456",
    name: "김라임"

  }
  mockUserService.findUserByClientId.mockReturnValue(true)
  const signUp = await userController.signUp(mockRequest, mockResponse, mockNext);
  expect(mockUserService.findUserByClientId).toHaveBeenCalledTimes(1)
  expect(mockNext).toHaveBeenCalledWith(new CustomError(409, "이미 가입된 사용자입니다.."))
})
