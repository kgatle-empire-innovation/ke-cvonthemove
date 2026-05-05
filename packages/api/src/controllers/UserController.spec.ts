import { UserController } from './UserController';
import { Request, Response } from 'express';

jest.mock('../services/UserService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        getAllUsers: jest.fn().mockResolvedValue([{ id: '1', email: 'test@example.com' }])
      };
    })
  };
});

describe('UserController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let controller: UserController;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    controller = new UserController();
  });

  it('should get all users', async () => {
    await controller.getAllUsers(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: '1', email: 'test@example.com' }] });
  });

  it('should handle errors', async () => {
    const mockServiceInstance = (controller as any).userService;
    mockServiceInstance.getAllUsers.mockRejectedValueOnce(new Error('Test error'));

    await controller.getAllUsers(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to fetch users' });
  });
});
