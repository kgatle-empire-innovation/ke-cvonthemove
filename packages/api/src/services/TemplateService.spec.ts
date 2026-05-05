import { TemplateService } from './TemplateService';
import { prisma } from '@cvonthemove/db';

jest.mock('@cvonthemove/db', () => ({
  prisma: {
    template: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TemplateService();
  });

  describe('getAllTemplates', () => {
    it('should return all templates ordered by createdAt desc', async () => {
      const mockTemplates = [
        { id: '1', name: 'Template 1', createdAt: new Date() },
        { id: '2', name: 'Template 2', createdAt: new Date() },
      ];
      (prisma.template.findMany as jest.Mock).mockResolvedValueOnce(mockTemplates);

      const result = await service.getAllTemplates();

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTemplates);
    });

    it('should throw an error if findMany fails', async () => {
      const error = new Error('Database error');
      (prisma.template.findMany as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.getAllTemplates()).rejects.toThrow('Database error');
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by id', async () => {
      const mockTemplate = { id: '1', name: 'Template 1' };
      (prisma.template.findUnique as jest.Mock).mockResolvedValueOnce(mockTemplate);

      const result = await service.getTemplateById('1');

      expect(prisma.template.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should return null if template is not found', async () => {
      (prisma.template.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await service.getTemplateById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw an error if findUnique fails', async () => {
      const error = new Error('Database error');
      (prisma.template.findUnique as jest.Mock).mockRejectedValueOnce(error);

      await expect(service.getTemplateById('1')).rejects.toThrow('Database error');
    });
  });
});
