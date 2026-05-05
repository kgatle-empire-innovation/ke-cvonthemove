import { BaseService } from '../core/BaseService';

export class SessionPromotionService extends BaseService {
  /**
   * Promotes an anonymous session to an authenticated user account.
   * Reassigns all CVs (and their cascaded child records) from the sessionId to the new userId.
   * Ensures data is not orphaned by using a transaction.
   * Optionally cleans up the guest user record if it was a temporary guest account.
   *
   * @param sessionId The ID of the guest session
   * @param newUserId The ID of the newly authenticated user
   */
  public async promoteSession(sessionId: string, newUserId: string): Promise<void> {
    await this.db.$transaction(async (tx) => {
      // 1. Reassign all CVs from the session ID to the new user ID.
      // Because child records (WorkExperience, Education, Skill) are related
      // to the CV via cvId, they will implicitly "move" with the CV.
      await tx.cV.updateMany({
        where: { userId: sessionId },
        data: { userId: newUserId },
      });

      // 2. Check if the session user was a temporary guest user and delete it to avoid orphaned records.
      const guestUser = await tx.user.findUnique({ where: { id: sessionId } });
      if (guestUser && guestUser.email.startsWith(`guest_${sessionId}`)) {
        await tx.user.delete({ where: { id: sessionId } });
      }
    });
  }
}
