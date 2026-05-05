import { WizardController } from './WizardController';
import { Request, Response } from 'express';

jest.mock('../services/WizardService', () => {
  return {
    WizardService: jest.fn().mockImplementation(() => {
      return {
        upsertGuestSessionAndSaveWizardData: jest.fn().mockResolvedValue({ id: 'cv1', title: 'Test CV' })
      };
    })
  };
});

describe('WizardController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let controller: WizardController;

  beforeEach(() => {
    req = {
      headers: { 'x-session-id': '123e4567-e89b-12d3-a456-426614174000' },
      body: { cv: { title: 'Test CV' } }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    controller = new WizardController();
  });

  it('should successfully update wizard data', async () => {
    await controller.updateWizardData(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'cv1', title: 'Test CV' } });
  });

  it('should handle errors', async () => {
    const mockServiceInstance = (controller as any).wizardService;
    mockServiceInstance.upsertGuestSessionAndSaveWizardData.mockRejectedValueOnce(new Error('Test error'));

    await controller.updateWizardData(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to update wizard data: Test error' });
  });
});
