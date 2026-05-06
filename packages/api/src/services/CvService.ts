import { BaseService } from '../core/BaseService';
import { CV, WorkExperience, Education, Skill } from '@cvonthemove/db';

/** Full CV including all nested relation arrays. */
export type CvWithRelations = CV & {
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
};

/** Shape accepted by createCv / updateCv. */
export interface CvInput {
  title: string;
  summary?: string;
  templateId?: string;
}

const CV_INCLUDE = {
  workExperiences: true,
  educations: true,
  skills: true,
} as const;

export class CvService extends BaseService {
  /** Return all CVs belonging to a user (with nested relations). */
  public async getCvsForUser(userId: string): Promise<CvWithRelations[]> {
    return this.db.cV.findMany({
      where: { userId },
      include: CV_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    }) as Promise<CvWithRelations[]>;
  }

  /** Return a single CV, enforcing user ownership. */
  public async getCvById(id: string, userId: string): Promise<CvWithRelations> {
    const cv = await this.db.cV.findUniqueOrThrow({
      where: { id },
      include: CV_INCLUDE,
    });
    if (cv.userId !== userId) {
      throw new Error('Forbidden: CV does not belong to this user');
    }
    return cv as CvWithRelations;
  }

  /** Create a new blank CV for the authenticated user. */
  public async createCv(userId: string, data: CvInput): Promise<CvWithRelations> {
    return this.db.cV.create({
      data: {
        userId,
        title: data.title,
        summary: data.summary ?? '',
        templateId: data.templateId ?? null,
      },
      include: CV_INCLUDE,
    }) as Promise<CvWithRelations>;
  }

  /** Update mutable fields on a CV the user owns. */
  public async updateCv(
    id: string,
    userId: string,
    data: Partial<CvInput>
  ): Promise<CvWithRelations> {
    // Ownership check first
    await this.getCvById(id, userId);

    return this.db.cV.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.templateId !== undefined && { templateId: data.templateId }),
      },
      include: CV_INCLUDE,
    }) as Promise<CvWithRelations>;
  }

  /** Delete a CV (cascades to WorkExperience, Education, Skill via schema). */
  public async deleteCv(id: string, userId: string): Promise<void> {
    await this.getCvById(id, userId); // ownership check
    await this.db.cV.delete({ where: { id } });
  }

  /**
   * Deep-copy duplicate of a CV.
   *
   * Strategy:
   *  1. Fetch the original CV with all nested arrays using `include`.
   *  2. Strip auto-generated fields (id, cvId, createdAt, updatedAt) from each nested item.
   *  3. Create the new CV and all child records in a single `cV.create()` call using
   *     nested `{ create: [...] }` — this is atomic and efficient (one round-trip).
   */
  public async duplicateCv(id: string, userId: string): Promise<CvWithRelations> {
    const original = await this.getCvById(id, userId);

    const {
      workExperiences,
      educations,
      skills,
    } = original;

    // Strip auto-generated fields from each nested array item
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stripWe = workExperiences.map(({ id: _id, cvId: _cvId, createdAt: _ca, updatedAt: _ua, ...rest }) => rest);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stripEd = educations.map(({ id: _id, cvId: _cvId, createdAt: _ca, updatedAt: _ua, ...rest }) => rest);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stripSk = skills.map(({ id: _id, cvId: _cvId, createdAt: _ca, updatedAt: _ua, ...rest }) => rest);

    return this.db.cV.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        summary: original.summary ?? '',
        templateId: original.templateId ?? null,
        workExperiences: { create: stripWe },
        educations: { create: stripEd },
        skills: { create: stripSk },
      },
      include: CV_INCLUDE,
    }) as Promise<CvWithRelations>;
  }
}
