import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TemplateService, ApiResponse } from './template.service';
import { Template } from '@cvonthemove/db';

describe('TemplateService', () => {
  let service: TemplateService;
  let httpMock: HttpTestingController;

  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Modern Template',
      description: 'A modern template',
      type: 'modern',
      properties: { primaryColor: '#000000', hasSidebar: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Classic Template',
      description: 'A classic template',
      type: 'classic',
      properties: { fontFamily: 'serif' },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TemplateService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TemplateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTemplates', () => {
    it('should return all templates on success', () => {
      const mockResponse: ApiResponse<Template[]> = {
        success: true,
        data: mockTemplates
      };

      service.getAllTemplates().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockTemplates);
      });

      const req = httpMock.expectOne('/api/templates');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle API error', () => {
      const mockResponse: ApiResponse<Template[]> = {
        success: false,
        error: 'Failed to fetch templates'
      };

      service.getAllTemplates().subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Failed to fetch templates');
      });

      const req = httpMock.expectOne('/api/templates');
      req.flush(mockResponse);
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by id on success', () => {
      const mockTemplate = mockTemplates[0];
      const mockResponse: ApiResponse<Template> = {
        success: true,
        data: mockTemplate
      };

      service.getTemplateById('1').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockTemplate);
      });

      const req = httpMock.expectOne('/api/templates/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle API error when template not found', () => {
      const mockResponse: ApiResponse<Template> = {
        success: false,
        error: 'Template not found'
      };

      service.getTemplateById('non-existent').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('Template not found');
      });

      const req = httpMock.expectOne('/api/templates/non-existent');
      req.flush(mockResponse, { status: 404, statusText: 'Not Found' });
    });
  });
});
