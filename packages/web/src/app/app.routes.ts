import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { WizardComponent } from './wizard/wizard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'wizard', component: WizardComponent },
];
