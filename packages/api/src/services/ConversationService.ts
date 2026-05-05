import { prisma } from '@cvonthemove/db';
import { BaseService } from '../core/BaseService';

export enum ConversationStateName {
  START = 'START',
  AWAITING_TITLE = 'AWAITING_TITLE',
  AWAITING_SUMMARY = 'AWAITING_SUMMARY',
  AWAITING_WORK_EXPERIENCE = 'AWAITING_WORK_EXPERIENCE',
  // Add more as needed
}

export class ConversationService extends BaseService {
  /**
   * Processes an incoming message from a chat platform.
   * @param sessionId The unique ID of the chat user (e.g., whatsapp:+12345)
   * @param message The text content of the message
   * @returns The response message to send back to the user
   */
  public async processMessage(sessionId: string, message: string): Promise<string> {
    // 1. Get or create conversation state
    let convState = await this.db.conversationState.findUnique({
      where: { sessionId }
    });

    if (!convState) {
      convState = await this.db.conversationState.create({
        data: {
          sessionId,
          state: ConversationStateName.START,
          context: {}
        }
      });
    }

    // 2. Handle state transitions
    switch (convState.state) {
      case ConversationStateName.START:
        return this.handleStart(sessionId);
      
      case ConversationStateName.AWAITING_TITLE:
        return this.handleAwaitingTitle(sessionId, message);

      case ConversationStateName.AWAITING_SUMMARY:
        return this.handleAwaitingSummary(sessionId, message);

      default:
        return "I'm sorry, I'm not sure how to help with that yet. Type 'start' to begin your CV.";
    }
  }

  private async handleStart(sessionId: string): Promise<string> {
    // Initialize or find user/cv
    await this.ensureUserAndCv(sessionId);
    
    await this.updateState(sessionId, ConversationStateName.AWAITING_TITLE);
    return "Welcome to CV on the Move! Let's start building your professional CV. What should be the title of your CV? (e.g., 'Senior Software Engineer')";
  }

  private async handleAwaitingTitle(sessionId: string, title: string): Promise<string> {
    const cv = await this.db.cV.findFirst({
      where: { userId: sessionId }
    });

    if (cv) {
      await this.db.cV.update({
        where: { id: cv.id },
        data: { title }
      });
    }

    await this.updateState(sessionId, ConversationStateName.AWAITING_SUMMARY);
    return "Got it. Now, tell me a bit about yourself. A short professional summary works best!";
  }

  private async handleAwaitingSummary(sessionId: string, summary: string): Promise<string> {
    const cv = await this.db.cV.findFirst({
      where: { userId: sessionId }
    });

    if (cv) {
      await this.db.cV.update({
        where: { id: cv.id },
        data: { summary }
      });
    }

    // In a real app, we would transition to Work Experience next
    await this.updateState(sessionId, ConversationStateName.START);
    return "Thank you! Your summary has been updated. You can now see these changes in the web app. Feel free to add more details there!";
  }

  private async ensureUserAndCv(sessionId: string) {
    // Reuse the logic from WizardService but simplified here
    await this.db.user.upsert({
      where: { id: sessionId },
      update: {},
      create: {
        id: sessionId,
        email: `chat_${sessionId}@cvonthemove.local`
      }
    });

    const cv = await this.db.cV.findFirst({
      where: { userId: sessionId }
    });

    if (!cv) {
      await this.db.cV.create({
        data: {
          userId: sessionId,
          title: 'Untitled CV',
          summary: ''
        }
      });
    }
  }

  private async updateState(sessionId: string, state: ConversationStateName, context: any = {}) {
    await this.db.conversationState.update({
      where: { sessionId },
      data: { state, context }
    });
  }
}
