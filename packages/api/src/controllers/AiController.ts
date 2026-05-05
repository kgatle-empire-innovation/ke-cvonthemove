import { Request, Response } from 'express';
import { AiService } from '../services/AiService';
import { AiRefineRequest, AiRefineResponse } from '@cvonthemove/db';
import { ApiResponse } from '../core/ApiResponse';

export class AiController {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  refineText = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as AiRefineRequest;
      
      if (!body.text || !body.type) {
        const errorResponse: ApiResponse = {
          success: false,
          error: 'Missing required fields: text and type'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const result = await this.aiService.refineText(body);
      
      const response: ApiResponse<AiRefineResponse> = {
        success: true,
        data: result
      };
      
      res.json(response);
    } catch (error: any) {
      console.error('AiController refineText error:', error);
      const errorResponse: ApiResponse = {
        success: false,
        error: error.message || 'Internal server error'
      };
      res.status(500).json(errorResponse);
    }
  };
}
