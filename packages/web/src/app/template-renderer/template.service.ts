import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '@cvonthemove/db';
import { ApiResponse } from '../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = '/api/templates';

  constructor(private http: HttpClient) {}

  getAllTemplates(): Observable<ApiResponse<Template[]>> {
    return this.http.get<ApiResponse<Template[]>>(this.apiUrl);
  }

  getTemplateById(id: string): Observable<ApiResponse<Template>> {
    return this.http.get<ApiResponse<Template>>(`${this.apiUrl}/${id}`);
  }
}
