import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { WizardComponent } from './wizard.component';
import { WizardService } from './wizard.service';

import { vi } from 'vitest';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let wizardServiceMock: any;

  beforeEach(async () => {
    wizardServiceMock = {
      updateWizardData: vi.fn().mockReturnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, WizardComponent],
      providers: [
        { provide: WizardService, useValue: wizardServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateWizardData when form changes (debounced)', () => {
    vi.useFakeTimers();
    component.wizardForm.patchValue({ cv: { title: 'New Title' } });
    vi.advanceTimersByTime(500);
    expect(wizardServiceMock.updateWizardData).toHaveBeenCalledWith({ cv: { title: 'New Title', summary: '' } });
    expect(component.saveStatus).toBe('Saved');
    vi.advanceTimersByTime(2000);
    expect(component.saveStatus).toBe('');
    vi.useRealTimers();
  });

  it('should handle error when updating wizard data', () => {
    vi.useFakeTimers();
    wizardServiceMock.updateWizardData = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    component.wizardForm.patchValue({ cv: { title: 'Failed Title' } });
    vi.advanceTimersByTime(500);
    expect(wizardServiceMock.updateWizardData).toHaveBeenCalled();
    expect(component.saveStatus).toBe('Error saving data');
    vi.useRealTimers();
  });

  it('should cleanup on destroy', () => {
    component.ngOnDestroy();
    expect(component['destroy$'].isStopped).toBe(true);
  });
});
