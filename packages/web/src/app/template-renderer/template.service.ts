import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '@cvonthemove/db';
import { BaseService } from '../common/base/BaseService';
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends BaseService {

  constructor(private http: HttpClient) {
    super();
    this.apiUrl = '/api/templates';
  }

  getAllTemplates(): Observable<ApiResponse<Template[]>> {
    return this.http.get<ApiResponse<Template[]>>(this.apiUrl);
  }

  getTemplateById(id: string): Observable<ApiResponse<Template>> {
    return this.http.get<ApiResponse<Template>>(`${this.apiUrl}/${id}`);
  }
}
