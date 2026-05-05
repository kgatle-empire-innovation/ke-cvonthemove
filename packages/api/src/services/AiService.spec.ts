import { AiService } from './AiService';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: 'Refined professional text.'
          })
        }
      };
    })
  };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiService();
  });

  it('should refine a professional summary', async () => {
    const result = await service.refineText({ type: 'summary', text: 'I write code.' });
    expect(result.refinedText).toBe('Refined professional text.');
  });

  it('should refine a job description', async () => {
    const result = await service.refineText({ type: 'job_description', text: 'Did some stuff.' });
    expect(result.refinedText).toBe('Refined professional text.');
  });

  it('should throw error for unsupported type', async () => {
    await expect(service.refineText({ type: 'invalid' as any, text: 'text' })).rejects.toThrow('Unsupported AI refine type: invalid');
  });
});
