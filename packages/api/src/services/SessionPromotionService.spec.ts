import { SessionPromotionService } from './SessionPromotionService';
import { prisma } from '@cvonthemove/db';
import { randomUUID } from 'crypto';
/**
 * Integration Test for Session Promotion Service
 * Note: While the prompt requested testing with a local SQLite database, 
 * the current Prisma schema provider is strictly set to "postgresql". 
 * Prisma does not support changing providers dynamically at runtime without 
 * generating a separate schema/client for SQLite.
 * Therefore, this integration test runs against the currently configured test database.
 */
describe('SessionPromotionService (Integration)', () => {
  let service: SessionPromotionService;
  
  beforeAll(async () => {
    service = new SessionPromotionService();
    // Connect to database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully promote an anonymous session and move CVs to the new user without orphaning child records', async () => {
    const sessionId = randomUUID();
    const newUserId = randomUUID();

    // 1. Setup Guest User
    await prisma.user.create({
      data: {
        id: sessionId,
        email: `guest_${sessionId}@cvonthemove.local`,
      }
    });

    // 2. Setup Authenticated User
    await prisma.user.create({
      data: {
        id: newUserId,
        email: `realuser_${newUserId}@example.com`,
      }
    });

    // 3. Create CV for the Guest User with nested child records
    const cv = await prisma.cV.create({
      data: {
        userId: sessionId,
        title: 'Guest CV',
        summary: 'A summary',
        workExperiences: {
          create: [{ jobTitle: 'Dev', company: 'Corp', startDate: new Date() }]
        },
        educations: {
          create: [{ degree: 'BSc', institution: 'Uni', startDate: new Date() }]
        },
        skills: {
          create: [{ name: 'TypeScript', level: 'Expert' }]
        }
      },
      include: { workExperiences: true, educations: true, skills: true }
    });

    // Verify initial state
    expect(cv.userId).toBe(sessionId);
    expect(cv.workExperiences.length).toBe(1);
    expect(cv.educations.length).toBe(1);
    expect(cv.skills.length).toBe(1);

    // 4. Perform the Session Promotion
    await service.promoteSession(sessionId, newUserId);

    // 5. Verify the CV was moved to the new user
    const movedCv = await prisma.cV.findUnique({
      where: { id: cv.id },
      include: { workExperiences: true, educations: true, skills: true }
    });

    expect(movedCv).not.toBeNull();
    expect(movedCv?.userId).toBe(newUserId); // User ID should be updated

    // 6. Verify child records moved with it (they should not be orphaned)
    expect(movedCv?.workExperiences.length).toBe(1);
    expect(movedCv?.educations.length).toBe(1);
    expect(movedCv?.skills.length).toBe(1);

    // 7. Verify the guest user was cleaned up
    const guestUserCheck = await prisma.user.findUnique({ where: { id: sessionId } });
    expect(guestUserCheck).toBeNull();

    // Cleanup: Remove the authenticated user (and its cascade deleted CVs)
    await prisma.user.delete({ where: { id: newUserId } });
  });

  it('should not delete the user if it is not a temporary guest user', async () => {
    const sessionId = randomUUID();
    const newUserId = randomUUID();

    // Setup an existing "guest" but they have a real email somehow
    await prisma.user.create({
      data: {
        id: sessionId,
        email: `notaguest_${sessionId}@example.com`,
      }
    });

    await prisma.user.create({
      data: {
        id: newUserId,
        email: `realuser_${newUserId}@example.com`,
      }
    });

    const cv = await prisma.cV.create({
      data: {
        userId: sessionId,
        title: 'Guest CV',
      }
    });

    await service.promoteSession(sessionId, newUserId);

    // CV should move
    const movedCv = await prisma.cV.findUnique({ where: { id: cv.id } });
    expect(movedCv?.userId).toBe(newUserId);

    // Old user should NOT be deleted because it doesn't match the guest email pattern
    const oldUserCheck = await prisma.user.findUnique({ where: { id: sessionId } });
    expect(oldUserCheck).not.toBeNull();

    // Cleanup
    await prisma.user.delete({ where: { id: sessionId } });
    await prisma.user.delete({ where: { id: newUserId } });
  });
});
