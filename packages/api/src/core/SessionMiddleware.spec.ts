import { validateSessionId } from './SessionMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('SessionMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if x-session-id is missing', () => {
    validateSessionId(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Missing or invalid X-Session-ID header' });
  });

  it('should return 400 if x-session-id is not a valid UUID', () => {
    req.headers!['x-session-id'] = 'invalid-uuid';
    validateSessionId(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'X-Session-ID must be a valid UUID' });
  });

  it('should call next if x-session-id is valid', () => {
    req.headers!['x-session-id'] = '123e4567-e89b-12d3-a456-426614174000';
    validateSessionId(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
