import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { WizardService } from './wizard.service';

describe('WizardService', () => {
  let service: WizardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WizardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WizardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a session ID if not in sessionStorage', () => {
    sessionStorage.clear();
    const newService = new WizardService(TestBed.inject(HttpClient));
    expect(newService.getSessionId()).toBeDefined();
    expect(sessionStorage.getItem('wizard_session_id')).toEqual(newService.getSessionId());
  });

  it('should retrieve existing session ID from sessionStorage', () => {
    sessionStorage.setItem('wizard_session_id', 'existing-id');
    const newService = new WizardService(TestBed.inject(HttpClient));
    expect(newService.getSessionId()).toEqual('existing-id');
  });

  it('should patch wizard data with session ID header', () => {
    const data = { cv: { title: 'Test' } };
    service.updateWizardData(data).subscribe(res => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne('/api/cv/wizard');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.headers.get('X-Session-ID')).toEqual(service.getSessionId());
    req.flush({ success: true, data: { id: 'cv1', title: 'Test' } });
  });
});
