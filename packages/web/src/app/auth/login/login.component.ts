import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public mode: 'login' | 'register' = 'login';
  public form: FormGroup;
  public isLoading = false;
  public errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name:     [''],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  public toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.form.get('name')?.reset();
  }

  public onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, name } = this.form.value;
    const request$ = this.mode === 'login'
      ? this.authService.login(email, password)
      : this.authService.register(email, password, name);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.promoteAndRedirect();
        } else {
          this.isLoading = false;
          this.errorMessage = res.error ?? 'An error occurred';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error ?? 'An unexpected error occurred';
      },
    });
  }

  /**
   * Silently promote the anonymous wizard session (if any) then redirect
   * to the dashboard. Even if promotion fails we still navigate — the CV
   * can be rebuilt or imported later.
   */
  private promoteAndRedirect(): void {
    const sessionId = sessionStorage.getItem('wizard_session_id');

    if (sessionId) {
      this.authService.promoteSession(sessionId).subscribe({
        next: () => {
          sessionStorage.removeItem('wizard_session_id');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          // Non-fatal: navigate anyway
          this.router.navigate(['/dashboard']);
        },
      });
    } else {
      this.router.navigate(['/dashboard']);
    }

    this.isLoading = false;
  }
}
