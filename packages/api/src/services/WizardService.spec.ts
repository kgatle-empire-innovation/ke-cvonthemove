import { WizardService } from './WizardService';
import { prisma } from '@cvonthemove/db';

jest.mock('@cvonthemove/db', () => ({
  prisma: {
    user: { upsert: jest.fn() },
    cV: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() },
    workExperience: { update: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    education: { update: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    skill: { update: jest.fn(), create: jest.fn(), updateMany: jest.fn() }
  }
}));

describe('WizardService', () => {
  let service: WizardService;
  const sessionId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WizardService();
  });

  it('should create user, cv, we, ed, skill when they do not exist', async () => {
    (prisma.cV.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.cV.create as jest.Mock).mockResolvedValueOnce({ id: 'cv1' });
    (prisma.cV.findUniqueOrThrow as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'My CV' });

    const result = await service.upsertGuestSessionAndSaveWizardData(sessionId, {
      cv: { title: 'My CV', summary: 'Hello' },
      workExperiences: [{ company: 'Corp', jobTitle: 'Dev', startDate: new Date() }],
      educations: [{ degree: 'BSc', institution: 'Uni', startDate: new Date() }],
      skills: [{ name: 'TS', level: 'Pro' }]
    });

    expect(prisma.user.upsert).toHaveBeenCalled();
    expect(prisma.cV.create).toHaveBeenCalled();
    expect(prisma.workExperience.create).toHaveBeenCalled();
    expect(prisma.education.create).toHaveBeenCalled();
    expect(prisma.skill.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'cv1', title: 'My CV' });
  });

  it('should update cv, we, ed, skill when they exist', async () => {
    (prisma.cV.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'Old' });
    (prisma.cV.update as jest.Mock).mockResolvedValueOnce({ id: 'cv1' });
    (prisma.cV.findUniqueOrThrow as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'New CV' });

    const result = await service.upsertGuestSessionAndSaveWizardData(sessionId, {
      cv: { title: 'New CV' },
      workExperiences: [{ id: 'we1', company: 'Corp', jobTitle: 'Dev', startDate: new Date() }],
      educations: [{ id: 'ed1', degree: 'BSc', institution: 'Uni', startDate: new Date() }],
      skills: [{ id: 'sk1', name: 'TS', level: 'Pro' }]
    });

    expect(prisma.cV.update).toHaveBeenCalled();
    expect(prisma.workExperience.updateMany).toHaveBeenCalledWith({
      where: { id: 'we1', cvId: 'cv1' },
      data: expect.anything()
    });
    expect(prisma.education.updateMany).toHaveBeenCalledWith({
      where: { id: 'ed1', cvId: 'cv1' },
      data: expect.anything()
    });
    expect(prisma.skill.updateMany).toHaveBeenCalledWith({
      where: { id: 'sk1', cvId: 'cv1' },
      data: expect.anything()
    });
    expect(result).toEqual({ id: 'cv1', title: 'New CV' });
  });

  it('should not update cv if data is empty', async () => {
    (prisma.cV.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'Old' });
    (prisma.cV.findUniqueOrThrow as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'Old' });

    await service.upsertGuestSessionAndSaveWizardData(sessionId, {
      cv: {}
    });

    expect(prisma.cV.update).not.toHaveBeenCalled();
  });

  it('should handle missing arrays without error', async () => {
    (prisma.cV.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'Old' });
    (prisma.cV.findUniqueOrThrow as jest.Mock).mockResolvedValueOnce({ id: 'cv1', title: 'Old' });

    await service.upsertGuestSessionAndSaveWizardData(sessionId, {});

    expect(prisma.workExperience.create).not.toHaveBeenCalled();
    expect(prisma.education.create).not.toHaveBeenCalled();
    expect(prisma.skill.create).not.toHaveBeenCalled();
  });

  it('should only update skills belonging to the current CV (IDOR check)', async () => {
    const ownCvId = 'cv1';
    const otherSkillId = 'other-skill-id';

    (prisma.cV.findFirst as jest.Mock).mockResolvedValueOnce({ id: ownCvId, userId: sessionId });
    (prisma.cV.findUniqueOrThrow as jest.Mock).mockResolvedValueOnce({ id: ownCvId });

    await service.upsertGuestSessionAndSaveWizardData(sessionId, {
      skills: [{ id: otherSkillId, name: 'Malicious Update', level: 'Expert' }]
    });

    expect(prisma.skill.updateMany).toHaveBeenCalledWith({
      where: { id: otherSkillId, cvId: ownCvId },
      data: expect.anything()
    });

    // Check that update was NOT called (it was replaced by updateMany)
    expect(prisma.skill.update).not.toHaveBeenCalled();
  });
});
