import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WizardService, WizardData } from './wizard.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit, OnDestroy {
  public wizardForm: FormGroup;
  private destroy$ = new Subject<void>();
  public saveStatus: string = '';

  constructor(private fb: FormBuilder, private wizardService: WizardService) {
    this.wizardForm = this.fb.group({
      cv: this.fb.group({
        title: [''],
        summary: ['']
      })
    });
  }

  ngOnInit() {
    this.wizardForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.saveData(value);
      });
  }

  private saveData(data: any) {
    this.saveStatus = 'Saving...';
    
    const wizardData: WizardData = {
      cv: data.cv
    };

    this.wizardService.updateWizardData(wizardData).subscribe({
      next: () => {
        this.saveStatus = 'Saved';
        setTimeout(() => { if (this.saveStatus === 'Saved') this.saveStatus = ''; }, 2000);
      },
      error: () => {
        this.saveStatus = 'Error saving data';
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
