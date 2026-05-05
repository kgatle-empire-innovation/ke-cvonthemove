import { ConversationService, ConversationStateName } from './ConversationService';
import { prisma } from '@cvonthemove/db';

jest.mock('@cvonthemove/db', () => ({
  prisma: {
    conversationState: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      upsert: jest.fn(),
    },
    cV: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('ConversationService', () => {
  let service: ConversationService;
  const sessionId = 'whatsapp:+1234567890';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConversationService();
  });

  it('should handle the START state by welcoming the user and moving to AWAITING_TITLE', async () => {
    (prisma.conversationState.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conversationState.create as jest.Mock).mockResolvedValue({ sessionId, state: ConversationStateName.START });
    (prisma.cV.findFirst as jest.Mock).mockResolvedValue({ id: 'cv-123' });

    const response = await service.processMessage(sessionId, 'hi');

    expect(response).toContain("Welcome to CV on the Move");
    expect(prisma.conversationState.update).toHaveBeenCalledWith({
      where: { sessionId },
      data: { state: ConversationStateName.AWAITING_TITLE, context: {} }
    });
  });

  it('should handle the AWAITING_TITLE state by saving the title and moving to AWAITING_SUMMARY', async () => {
    (prisma.conversationState.findUnique as jest.Mock).mockResolvedValue({ sessionId, state: ConversationStateName.AWAITING_TITLE });
    (prisma.cV.findFirst as jest.Mock).mockResolvedValue({ id: 'cv-123' });

    const response = await service.processMessage(sessionId, 'Software Engineer');

    expect(response).toContain("tell me a bit about yourself");
    expect(prisma.cV.update).toHaveBeenCalledWith({
      where: { id: 'cv-123' },
      data: { title: 'Software Engineer' }
    });
    expect(prisma.conversationState.update).toHaveBeenCalledWith({
      where: { sessionId },
      data: { state: ConversationStateName.AWAITING_SUMMARY, context: {} }
    });
  });

  it('should handle the AWAITING_SUMMARY state by saving the summary and resetting to START', async () => {
    (prisma.conversationState.findUnique as jest.Mock).mockResolvedValue({ sessionId, state: ConversationStateName.AWAITING_SUMMARY });
    (prisma.cV.findFirst as jest.Mock).mockResolvedValue({ id: 'cv-123' });

    const response = await service.processMessage(sessionId, 'I am a passionate dev.');

    expect(response).toContain("Your summary has been updated");
    expect(prisma.cV.update).toHaveBeenCalledWith({
      where: { id: 'cv-123' },
      data: { summary: 'I am a passionate dev.' }
    });
    expect(prisma.conversationState.update).toHaveBeenCalledWith({
      where: { sessionId },
      data: { state: ConversationStateName.START, context: {} }
    });
  });
});
