import { BaseService } from '../core/BaseService';
import { CV, WorkExperience, Education, Skill } from '@cvonthemove/db';

export class WizardService extends BaseService {
  public async upsertGuestSessionAndSaveWizardData(
    sessionId: string, 
    data: { cv?: Partial<CV>, workExperiences?: Partial<WorkExperience>[], educations?: Partial<Education>[], skills?: Partial<Skill>[] }
  ): Promise<CV> {
    
    await this.db.user.upsert({
      where: { id: sessionId },
      update: {},
      create: {
        id: sessionId,
        email: `guest_${sessionId}@cvonthemove.local`
      }
    });

    const cvData = data.cv || {};
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

    if (data.workExperiences) {
      for (const we of data.workExperiences) {
        if (we.id) {
          await this.db.workExperience.updateMany({
            where: { id: we.id, cvId: cv.id },
            data: { jobTitle: we.jobTitle, company: we.company, startDate: we.startDate, endDate: we.endDate, description: we.description }
          });
        } else {
          await this.db.workExperience.create({ data: { ...we, cvId: cv.id } as any });
        }
      }
    }
    
    if (data.educations) {
      for (const ed of data.educations) {
        if (ed.id) {
          await this.db.education.updateMany({
            where: { id: ed.id, cvId: cv.id },
            data: { degree: ed.degree, institution: ed.institution, startDate: ed.startDate, endDate: ed.endDate, description: ed.description }
          });
        } else {
          await this.db.education.create({ data: { ...ed, cvId: cv.id } as any });
        }
      }
    }
    
    if (data.skills) {
      for (const sk of data.skills) {
        if (sk.id) {
          await this.db.skill.updateMany({
            where: { id: sk.id, cvId: cv.id },
            data: { name: sk.name, level: sk.level }
          });
        } else {
          await this.db.skill.create({ data: { ...sk, cvId: cv.id } as any });
        }
      }
    }

    return this.db.cV.findUniqueOrThrow({
      where: { id: cv.id },
      include: { workExperiences: true, educations: true, skills: true }
    });
  }
}
