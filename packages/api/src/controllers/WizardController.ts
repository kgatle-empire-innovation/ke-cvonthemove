import { Request, Response } from 'express';
import { BaseController } from '../core/BaseController';
import { WizardService } from '../services/WizardService';
import { CV } from '@cvonthemove/db';

export class WizardController extends BaseController {
  private wizardService: WizardService;

  constructor() {
    super();
    this.wizardService = new WizardService();
  }

  public updateWizardData = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const data = req.body;
      
      const updatedCV = await this.wizardService.upsertGuestSessionAndSaveWizardData(sessionId, data);
      this.sendSuccess<CV>(res, updatedCV);
    } catch (error: any) {
      this.sendError(res, 'Failed to update wizard data: ' + error.message);
    }
  };
}
