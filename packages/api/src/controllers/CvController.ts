import { Response } from 'express';
import { BaseController } from '../core/BaseController';
import { AuthenticatedRequest, Protected } from '../core/AuthGuard';
import { CvService, CvWithRelations, CvInput } from '../services/CvService';

/**
 * CvController — all endpoints require a valid JWT.
 *
 * The `@Protected()` decorator marks each handler as protected at the
 * metadata level. Actual enforcement is performed by the `requireAuth`
 * middleware registered on each route in index.ts.
 */
export class CvController extends BaseController {
  private cvService: CvService;

  constructor() {
    super();
    this.cvService = new CvService();
  }

  /** GET /api/cv — list all CVs for the authenticated user. */
  @Protected()
  public getMyCvs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cvs = await this.cvService.getCvsForUser(req.user!.userId);
      this.sendSuccess<CvWithRelations[]>(res, cvs);
    } catch (error: any) {
      this.sendError(res, error.message || 'Failed to fetch CVs');
    }
  };

  /** GET /api/cv/:id — get a single CV by ID (ownership enforced). */
  @Protected()
  public getCvById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cv = await this.cvService.getCvById(req.params['id'], req.user!.userId);
      this.sendSuccess<CvWithRelations>(res, cv);
    } catch (error: any) {
      if (error.message?.startsWith('Forbidden')) {
        this.sendError(res, error.message, 403);
      } else {
        this.sendNotFound(res, 'CV not found');
      }
    }
  };

  /** POST /api/cv — create a new CV for the authenticated user. */
  @Protected()
  public createCv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const data: CvInput = req.body;
      if (!data.title) {
        this.sendBadRequest(res, 'title is required');
        return;
      }
      const cv = await this.cvService.createCv(req.user!.userId, data);
      this.sendCreated<CvWithRelations>(res, cv, 'CV created successfully');
    } catch (error: any) {
      this.sendError(res, error.message || 'Failed to create CV');
    }
  };

  /** PUT /api/cv/:id — update a CV the user owns. */
  @Protected()
  public updateCv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cv = await this.cvService.updateCv(req.params['id'], req.user!.userId, req.body);
      this.sendSuccess<CvWithRelations>(res, cv, 'CV updated');
    } catch (error: any) {
      if (error.message?.startsWith('Forbidden')) {
        this.sendError(res, error.message, 403);
      } else {
        this.sendError(res, error.message || 'Failed to update CV');
      }
    }
  };

  /** DELETE /api/cv/:id — delete a CV the user owns. */
  @Protected()
  public deleteCv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await this.cvService.deleteCv(req.params['id'], req.user!.userId);
      this.sendSuccess(res, null, 'CV deleted successfully');
    } catch (error: any) {
      if (error.message?.startsWith('Forbidden')) {
        this.sendError(res, error.message, 403);
      } else {
        this.sendError(res, error.message || 'Failed to delete CV');
      }
    }
  };

  /**
   * POST /api/cv/:id/duplicate — deep-copy a CV with all nested relations.
   * Uses Prisma `include` to fetch the original, then creates the duplicate
   * atomically in a single `cV.create()` call with nested `{ create: [...] }`.
   */
  @Protected()
  public duplicateCv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const duplicate = await this.cvService.duplicateCv(req.params['id'], req.user!.userId);
      this.sendCreated<CvWithRelations>(res, duplicate, 'CV duplicated successfully');
    } catch (error: any) {
      if (error.message?.startsWith('Forbidden')) {
        this.sendError(res, error.message, 403);
      } else {
        this.sendError(res, error.message || 'Failed to duplicate CV');
      }
    }
  };
}
