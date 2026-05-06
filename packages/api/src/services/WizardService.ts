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
      const existingWE = data.workExperiences.filter(we => we.id);
      const newWE = data.workExperiences.filter(we => !we.id);

      await Promise.all([
        ...existingWE.map(we =>
          this.db.workExperience.update({
            where: { id: we.id },
            data: {
              jobTitle: we.jobTitle,
              company: we.company,
              startDate: we.startDate,
              endDate: we.endDate,
              description: we.description
            }
          })
        ),
        newWE.length > 0 ? this.db.workExperience.createMany({
          data: newWE.map(we => ({ ...we, cvId: cv!.id } as any))
        }) : Promise.resolve()
      ]);
    }
    
    if (data.educations) {
      const existingEd = data.educations.filter(ed => ed.id);
      const newEd = data.educations.filter(ed => !ed.id);

      await Promise.all([
        ...existingEd.map(ed =>
          this.db.education.update({
            where: { id: ed.id },
            data: {
              degree: ed.degree,
              institution: ed.institution,
              startDate: ed.startDate,
              endDate: ed.endDate,
              description: ed.description
            }
          })
        ),
        newEd.length > 0 ? this.db.education.createMany({
          data: newEd.map(ed => ({ ...ed, cvId: cv!.id } as any))
        }) : Promise.resolve()
      ]);
    }
    
    if (data.skills) {
      const existingSkills = data.skills.filter(sk => sk.id);
      const newSkills = data.skills.filter(sk => !sk.id);

      await Promise.all([
        ...existingSkills.map(sk =>
          this.db.skill.update({
            where: { id: sk.id },
            data: { name: sk.name, level: sk.level }
          })
        ),
        newSkills.length > 0 ? this.db.skill.createMany({
          data: newSkills.map(sk => ({ ...sk, cvId: cv!.id } as any))
        }) : Promise.resolve()
      ]);
    }

    return this.db.cV.findUniqueOrThrow({
      where: { id: cv.id },
      include: { workExperiences: true, educations: true, skills: true }
    });
  }
}
