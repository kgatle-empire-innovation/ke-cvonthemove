import { BaseService } from '../core/BaseService';
import { CV, WorkExperience, Education, Skill } from '@cvonthemove/db';

export class WizardService extends BaseService {
  public async upsertGuestSessionAndSaveWizardData(
    sessionId: string, 
    data: { cv?: Partial<CV>, workExperiences?: Partial<WorkExperience>[], educations?: Partial<Education>[], skills?: Partial<Skill>[] }
  ): Promise<CV> {
    
    await this.upsertGuestUser(sessionId);

    const cv = await this.upsertCV(sessionId, data.cv);

    if (data.workExperiences) {
      await this.syncWorkExperiences(cv.id, data.workExperiences);
    }

    if (data.educations) {
      await this.syncEducations(cv.id, data.educations);
    }

    if (data.skills) {
      await this.syncSkills(cv.id, data.skills);
    }

    return this.db.cV.findUniqueOrThrow({
      where: { id: cv.id },
      include: { workExperiences: true, educations: true, skills: true }
    });
  }

  private async upsertGuestUser(sessionId: string): Promise<void> {
    await this.db.user.upsert({
      where: { id: sessionId },
      update: {},
      create: {
        id: sessionId,
        email: `guest_${sessionId}@cvonthemove.local`
      }
    });
  }

  private async upsertCV(sessionId: string, cvData: Partial<CV> = {}): Promise<CV> {
    let cv = await this.db.cV.findFirst({
      where: { userId: sessionId }
    });

    if (cv) {
      if (Object.keys(cvData).length > 0) {
        cv = await this.db.cV.update({
          where: { id: cv.id },
          data: {
            title: cvData.title,
            summary: cvData.summary,
          }
        });
      }
    } else {
      cv = await this.db.cV.create({
        data: {
          userId: sessionId,
          title: cvData.title || 'Untitled CV',
          summary: cvData.summary || '',
        }
      });
    }

    return cv;
  }

  private async syncWorkExperiences(cvId: string, workExperiences: Partial<WorkExperience>[]): Promise<void> {
    for (const we of workExperiences) {
      if (we.id) {
        await this.db.workExperience.update({
          where: { id: we.id },
          data: {
            jobTitle: we.jobTitle,
            company: we.company,
            startDate: we.startDate,
            endDate: we.endDate,
            description: we.description
          }
        });
      } else {
        await this.db.workExperience.create({ data: { ...we, cvId } as any });
      }
    }
  }

  private async syncEducations(cvId: string, educations: Partial<Education>[]): Promise<void> {
    for (const ed of educations) {
      if (ed.id) {
        await this.db.education.update({
          where: { id: ed.id },
          data: {
            degree: ed.degree,
            institution: ed.institution,
            startDate: ed.startDate,
            endDate: ed.endDate,
            description: ed.description
          }
        });
      } else {
        await this.db.education.create({ data: { ...ed, cvId } as any });
      }
    }
  }

  private async syncSkills(cvId: string, skills: Partial<Skill>[]): Promise<void> {
    for (const sk of skills) {
      if (sk.id) {
        await this.db.skill.update({
          where: { id: sk.id },
          data: {
            name: sk.name,
            level: sk.level
          }
        });
      } else {
        await this.db.skill.create({ data: { ...sk, cvId } as any });
      }
    }
  }
}
