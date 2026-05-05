import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CV, WorkExperience, Education, Skill, AiRefineRequest, AiRefineResponse } from '@cvonthemove/db';
import { BaseService } from '../common/base/BaseService';
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WizardData {
  cv?: Partial<CV>;
  workExperiences?: Partial<WorkExperience>[];
  educations?: Partial<Education>[];
  skills?: Partial<Skill>[];
}

@Injectable({
  providedIn: 'root'
})
export class WizardService extends BaseService {
  private sessionId: string;

  constructor(private http: HttpClient) {
    super();
    const stored = sessionStorage.getItem('wizard_session_id');
    if (stored) {
      this.sessionId = stored;
    } else {
      this.sessionId = crypto.randomUUID();
      sessionStorage.setItem('wizard_session_id', this.sessionId);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public updateWizardData(data: WizardData): Observable<ApiResponse<CV>> {
    this.apiUrl = '/api/cv/wizard';
    const headers = new HttpHeaders({
      'X-Session-ID': this.sessionId
    });

    return this.http.patch<ApiResponse<CV>>(this.apiUrl, data, { headers });
  }

  public aiRefine(request: AiRefineRequest): Observable<ApiResponse<AiRefineResponse>> {
    this.apiUrl = '/api/ai/refine';
    const headers = new HttpHeaders({
      'X-Session-ID': this.sessionId
    });

    return this.http.post<ApiResponse<AiRefineResponse>>(this.apiUrl, request, { headers });
  }
}
