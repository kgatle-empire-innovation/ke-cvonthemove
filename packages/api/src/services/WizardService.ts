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

    const cvId = cv.id;
    await this.db.$transaction(async (tx) => {
      if (data.workExperiences) {
        const toCreate = data.workExperiences.filter(we => !we.id);
        const toUpdate = data.workExperiences.filter(we => we.id);

        if (toCreate.length > 0) {
          await tx.workExperience.createMany({
            data: toCreate.map(we => ({ ...we, cvId }) as any)
          });
        }

        for (const we of toUpdate) {
          await tx.workExperience.update({
            where: { id: we.id },
            data: { jobTitle: we.jobTitle, company: we.company, startDate: we.startDate, endDate: we.endDate, description: we.description }
          });
        }
      }

      if (data.educations) {
        const toCreate = data.educations.filter(ed => !ed.id);
        const toUpdate = data.educations.filter(ed => ed.id);

        if (toCreate.length > 0) {
          await tx.education.createMany({
            data: toCreate.map(ed => ({ ...ed, cvId }) as any)
          });
        }

        for (const ed of toUpdate) {
          await tx.education.update({
            where: { id: ed.id },
            data: { degree: ed.degree, institution: ed.institution, startDate: ed.startDate, endDate: ed.endDate, description: ed.description }
          });
        }
      }

      if (data.skills) {
        const toCreate = data.skills.filter(sk => !sk.id);
        const toUpdate = data.skills.filter(sk => sk.id);

        if (toCreate.length > 0) {
          await tx.skill.createMany({
            data: toCreate.map(sk => ({ ...sk, cvId }) as any)
          });
        }

        for (const sk of toUpdate) {
          await tx.skill.update({
            where: { id: sk.id },
            data: { name: sk.name, level: sk.level }
          });
        }
      }
    });

    return this.db.cV.findUniqueOrThrow({
      where: { id: cvId },
      include: { workExperiences: true, educations: true, skills: true }
    });
  }
}
