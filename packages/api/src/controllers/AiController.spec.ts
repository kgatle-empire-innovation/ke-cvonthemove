import { Request, Response } from 'express';
import { AiController } from './AiController';
import { AiService } from '../services/AiService';

jest.mock('../services/AiService');

describe('AiController', () => {
  let controller: AiController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new AiController();
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should return 400 if text or type is missing', async () => {
    req.body = { text: 'Some text' }; // missing type
    await controller.refineText(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Missing required fields: text and type'
    });
  });

  it('should refine text successfully', async () => {
    req.body = { text: 'Original text', type: 'summary' };
    
    const mockRefineText = jest.spyOn(AiService.prototype, 'refineText').mockResolvedValue({ refinedText: 'Refined text' });

    await controller.refineText(req as Request, res as Response);

    expect(mockRefineText).toHaveBeenCalledWith({ text: 'Original text', type: 'summary' });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { refinedText: 'Refined text' }
    });
  });

  it('should handle service errors', async () => {
    req.body = { text: 'Original text', type: 'summary' };
    
    const mockRefineText = jest.spyOn(AiService.prototype, 'refineText').mockRejectedValue(new Error('Service error'));

    await controller.refineText(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Service error'
    });
  });
});
