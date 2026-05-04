import { Request, Response } from 'express';
import { BaseController } from '../core/BaseController';
import { UserService } from '../services/UserService';
import { User } from '@cvonthemove/db';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      this.sendSuccess<User[]>(res, users);
    } catch (error) {
      this.sendError(res, 'Failed to fetch users');
    }
  };
}
