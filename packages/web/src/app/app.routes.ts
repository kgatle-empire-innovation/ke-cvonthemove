import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { WizardComponent } from './wizard/wizard.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '',          component: LandingComponent, pathMatch: 'full' },
  { path: 'wizard',   component: WizardComponent },
  { path: 'login',    component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
];
