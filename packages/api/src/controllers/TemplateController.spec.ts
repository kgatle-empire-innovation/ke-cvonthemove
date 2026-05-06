import { Request, Response } from 'express';
import { TemplateController } from './TemplateController';
import { TemplateService } from '../services/TemplateService';

jest.mock('../services/TemplateService');

describe('TemplateController', () => {
  let controller: TemplateController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new TemplateController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAllTemplates', () => {
    it('should return all templates successfully', async () => {
      const mockTemplates = [
        { id: '1', name: 'Template 1', content: '{}' },
        { id: '2', name: 'Template 2', content: '{}' },
      ];
      const mockGetAllTemplates = jest.spyOn(TemplateService.prototype, 'getAllTemplates').mockResolvedValue(mockTemplates as any);

      await controller.getAllTemplates(req as Request, res as Response);

      expect(mockGetAllTemplates).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemplates,
      });
    });

    it('should handle errors when fetching all templates', async () => {
      jest.spyOn(TemplateService.prototype, 'getAllTemplates').mockRejectedValue(new Error('Database error'));

      await controller.getAllTemplates(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch templates',
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return a template when found', async () => {
      const mockTemplate = { id: '1', name: 'Template 1', content: '{}' };
      req.params = { id: '1' };
      const mockGetTemplateById = jest.spyOn(TemplateService.prototype, 'getTemplateById').mockResolvedValue(mockTemplate as any);

      await controller.getTemplateById(req as Request, res as Response);

      expect(mockGetTemplateById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemplate,
      });
    });

    it('should return 404 when template is not found', async () => {
      req.params = { id: 'non-existent' };
      jest.spyOn(TemplateService.prototype, 'getTemplateById').mockResolvedValue(null);

      await controller.getTemplateById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Template not found',
      });
    });

    it('should handle errors when fetching template by id', async () => {
      req.params = { id: '1' };
      jest.spyOn(TemplateService.prototype, 'getTemplateById').mockRejectedValue(new Error('Database error'));

      await controller.getTemplateById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to fetch template',
      });
    });
  });
});
