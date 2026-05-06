import { Request, Response } from 'express';
import { BaseController } from '../core/BaseController';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';
import { SessionPromotionService } from '../services/SessionPromotionService';
import { AuthenticatedRequest } from '../core/AuthGuard';
import { User } from '@cvonthemove/db';

export class UserController extends BaseController {
  private userService: UserService;
  private authService: AuthService;
  private sessionPromotionService: SessionPromotionService;

  constructor() {
    super();
    this.userService = new UserService();
    this.authService = new AuthService();
    this.sessionPromotionService = new SessionPromotionService();
  }

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      this.sendSuccess<User[]>(res, users);
    } catch (error) {
      this.sendError(res, 'Failed to fetch users');
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      this.sendCreated(res, result, 'User registered successfully');
    } catch (error: any) {
      this.sendError(res, error.message || 'Registration failed', 400);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      this.sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      this.sendError(res, error.message || 'Login failed', 401);
    }
  };

  /**
   * Promotes an anonymous wizard session to the authenticated user account.
   * Expects { sessionId: string } in the request body.
   * Protected — requires a valid JWT (requireAuth middleware).
   */
  public promoteSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;
      const userId = req.user!.userId;
      if (!sessionId) {
        this.sendBadRequest(res, 'sessionId is required');
        return;
      }
      await this.sessionPromotionService.promoteSession(sessionId, userId);
      this.sendSuccess(res, null, 'Session promoted successfully');
    } catch (error: any) {
      this.sendError(res, error.message || 'Session promotion failed');
    }
  };
}
