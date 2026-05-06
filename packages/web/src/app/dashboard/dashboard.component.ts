import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, CvWithRelations } from './dashboard.service';
import { AuthService } from '../auth/auth.service';
import { User } from '@cvonthemove/db';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  public cvs: CvWithRelations[] = [];
  public isLoading = true;
  public errorMessage = '';
  public currentUser: Partial<User> | null = null;

  /** ID of the CV currently being acted on (for loading states per card). */
  public actioningId: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadCvs();
  }

  public loadCvs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getCvs().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.cvs = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load CVs. Please try again.';
      },
    });
  }

  public newCv(): void {
    this.dashboardService.createCv({ title: 'My New CV' }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cvs = [res.data, ...this.cvs];
        }
      },
      error: () => {
        this.errorMessage = 'Failed to create CV.';
      },
    });
  }

  public editCv(cv: CvWithRelations): void {
    // Store the CV id so the wizard knows which CV to load
    sessionStorage.setItem('editing_cv_id', cv.id);
    this.router.navigate(['/wizard']);
  }

  public duplicate(cv: CvWithRelations): void {
    this.actioningId = cv.id;
    this.dashboardService.duplicateCv(cv.id).subscribe({
      next: (res) => {
        this.actioningId = null;
        if (res.success && res.data) {
          this.cvs = [res.data, ...this.cvs];
        }
      },
      error: () => {
        this.actioningId = null;
        this.errorMessage = 'Failed to duplicate CV.';
      },
    });
  }

  public deleteCv(cv: CvWithRelations): void {
    if (!confirm(`Delete "${cv.title}"? This action cannot be undone.`)) return;

    this.actioningId = cv.id;
    this.dashboardService.deleteCv(cv.id).subscribe({
      next: () => {
        this.actioningId = null;
        this.cvs = this.cvs.filter(c => c.id !== cv.id);
      },
      error: () => {
        this.actioningId = null;
        this.errorMessage = 'Failed to delete CV.';
      },
    });
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
