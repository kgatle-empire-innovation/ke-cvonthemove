import { Request, Response } from 'express';
import { TemplateService } from '../services/TemplateService';
import { ApiResponse } from '../core/ApiResponse';
import { Template } from '@cvonthemove/db';

export class TemplateController {
  private templateService = new TemplateService();

  getAllTemplates = async (req: Request, res: Response<ApiResponse<Template[]>>) => {
    try {
      const templates = await this.templateService.getAllTemplates();
      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates',
      });
    }
  };

  getTemplateById = async (req: Request, res: Response<ApiResponse<Template>>) => {
    try {
      const { id } = req.params;
      const template = await this.templateService.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template',
      });
    }
  };
}
