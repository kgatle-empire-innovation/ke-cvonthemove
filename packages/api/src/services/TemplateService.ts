import { prisma, Template } from '@cvonthemove/db';
import { BaseService } from '../core/BaseService';

export class TemplateService extends BaseService {
  async getAllTemplates(): Promise<Template[]> {
    try {
      return await prisma.template.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<Template | null> {
    try {
      return await prisma.template.findUnique({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
