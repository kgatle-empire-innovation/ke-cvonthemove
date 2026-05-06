import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CV, WorkExperience, Education, Skill } from '@cvonthemove/db';
import { BaseService } from '../common/base/BaseService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Full CV with all nested relations — mirrors CvWithRelations on the API side. */
export type CvWithRelations = CV & {
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
};

export interface CvInput {
  title: string;
  summary?: string;
  templateId?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  public getCvs(): Observable<ApiResponse<CvWithRelations[]>> {
    this.apiUrl = '/api/cv';
    return this.http.get<ApiResponse<CvWithRelations[]>>(this.apiUrl);
  }

  public createCv(data: CvInput): Observable<ApiResponse<CvWithRelations>> {
    this.apiUrl = '/api/cv';
    return this.http.post<ApiResponse<CvWithRelations>>(this.apiUrl, data);
  }

  public updateCv(id: string, data: Partial<CvInput>): Observable<ApiResponse<CvWithRelations>> {
    this.apiUrl = `/api/cv/${id}`;
    return this.http.put<ApiResponse<CvWithRelations>>(this.apiUrl, data);
  }

  public deleteCv(id: string): Observable<ApiResponse<null>> {
    this.apiUrl = `/api/cv/${id}`;
    return this.http.delete<ApiResponse<null>>(this.apiUrl);
  }

  /**
   * Triggers a deep-copy duplicate of a CV on the server.
   * The API fetches the original with `include`, strips IDs from nested records,
   * and creates a new CV + all child records atomically.
   */
  public duplicateCv(id: string): Observable<ApiResponse<CvWithRelations>> {
    this.apiUrl = `/api/cv/${id}/duplicate`;
    return this.http.post<ApiResponse<CvWithRelations>>(this.apiUrl, {});
  }
}
