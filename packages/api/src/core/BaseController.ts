import { Request, Response } from 'express';
import { ApiResponse } from './ApiResponse';

export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    res.status(statusCode).json(response);
  }

  protected sendError(res: Response, error: string, statusCode = 500): void {
    const response: ApiResponse = {
      success: false,
      error,
    };
    res.status(statusCode).json(response);
  }

  protected sendCreated<T>(res: Response, data: T, message?: string): void {
    this.sendSuccess(res, data, message, 201);
  }

  protected sendNotFound(res: Response, message = 'Not found'): void {
    this.sendError(res, message, 404);
  }

  protected sendBadRequest(res: Response, message = 'Bad request'): void {
    this.sendError(res, message, 400);
  }
}
