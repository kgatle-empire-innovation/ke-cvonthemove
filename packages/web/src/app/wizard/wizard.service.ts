import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CV, WorkExperience, Education, Skill } from '@cvonthemove/db';
import { ApiResponse } from '../shared/models/api-response';

export interface WizardData {
  cv?: Partial<CV>;
  workExperiences?: Partial<WorkExperience>[];
  educations?: Partial<Education>[];
  skills?: Partial<Skill>[];
}

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  private sessionId: string;
  private readonly apiUrl = '/api/cv/wizard';

  constructor(private http: HttpClient) {
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
    const headers = new HttpHeaders({
      'X-Session-ID': this.sessionId
    });

    return this.http.patch<ApiResponse<CV>>(this.apiUrl, data, { headers });
  }
}
