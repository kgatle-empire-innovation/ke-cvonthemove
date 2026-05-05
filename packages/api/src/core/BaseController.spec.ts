import { Response } from 'express';
import { BaseController } from './BaseController';

class TestController extends BaseController {
  public testSendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): void {
    this.sendSuccess(res, data, message, statusCode);
  }

  public testSendError(res: Response, error: string, statusCode?: number): void {
    this.sendError(res, error, statusCode);
  }

  public testSendCreated<T>(res: Response, data: T, message?: string): void {
    this.sendCreated(res, data, message);
  }

  public testSendNotFound(res: Response, message?: string): void {
    this.sendNotFound(res, message);
  }

  public testSendBadRequest(res: Response, message?: string): void {
    this.sendBadRequest(res, message);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new TestController();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should send a success response with default status code 200', () => {
      const data = { id: 1 };
      controller.testSendSuccess(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: undefined,
      });
    });

    it('should send a success response with custom status code', () => {
      const data = { id: 1 };
      controller.testSendSuccess(mockResponse as Response, data, 'Success', 202);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Success',
      });
    });
  });

  describe('sendError', () => {
    it('should send an error response with default status code 500', () => {
      controller.testSendError(mockResponse as Response, 'Internal Error');

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Error',
      });
    });

    it('should send an error response with custom status code', () => {
      controller.testSendError(mockResponse as Response, 'Unauthorized', 401);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });
  });

  describe('sendCreated', () => {
    it('should send a 201 created response', () => {
      const data = { id: 1 };
      controller.testSendCreated(mockResponse as Response, data, 'Created');

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Created',
      });
    });
  });

  describe('sendNotFound', () => {
    it('should send a 404 not found response with default message', () => {
      controller.testSendNotFound(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
      });
    });

    it('should send a 404 not found response with custom message', () => {
      controller.testSendNotFound(mockResponse as Response, 'User not found');

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
    });
  });

  describe('sendBadRequest', () => {
    it('should send a 400 bad request response with default message', () => {
      controller.testSendBadRequest(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
      });
    });

    it('should send a 400 bad request response with custom message', () => {
      controller.testSendBadRequest(mockResponse as Response, 'Invalid input');

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid input',
      });
    });
  });
});
