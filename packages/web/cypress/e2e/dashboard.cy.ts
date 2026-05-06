/**
 * E2E: Dashboard flow
 *
 * Covers the full user journey:
 *   1. Anonymous CV creation via the wizard
 *   2. Registration with session promotion
 *   3. Dashboard loading & CV card rendering
 *   4. CV duplication (deep-copy)
 *   5. CV deletion
 *   6. Auth guard redirect for unauthenticated users
 */

// Unique email per run to avoid collisions
const TEST_EMAIL    = `e2e_${Date.now()}@cvotm.test`;
const TEST_PASSWORD = 'Str0ngPass!';
const SESSION_ID    = crypto.randomUUID();

describe('CV on the Move — Dashboard E2E', () => {
  // ── 1. Anonymous wizard creation ────────────────────────────────────────
  describe('Anonymous wizard', () => {
    it('creates a CV anonymously and persists it', () => {
      // Seed a CV for this anonymous session via the API command
      cy.createAnonymousCv(SESSION_ID, 'My Anonymous CV');

      // Visit the wizard page and verify it loads
      cy.visit('/wizard');
      cy.get('app-wizard').should('exist');

      // Type into the title field to trigger a debounced auto-save
      cy.get('input[formControlName="title"]').clear().type('Updated Anon CV');

      // Give debounce + network time to settle
      cy.wait(800);
    });
  });

  // ── 2. Register & promote session ───────────────────────────────────────
  describe('Register and promote session', () => {
    it('registers via UI, promotes session, and redirects to dashboard', () => {
      // Set the session ID in sessionStorage so LoginComponent picks it up
      cy.visit('/login', {
        onBeforeLoad(win) {
          win.sessionStorage.setItem('wizard_session_id', SESSION_ID);
        },
      });

      // Switch to register mode
      cy.get('#auth-toggle-btn').click();

      // Fill in the form
      cy.get('#name').type('E2E Tester');
      cy.get('#email').type(TEST_EMAIL);
      cy.get('#password').type(TEST_PASSWORD);

      cy.get('#auth-submit-btn').click();

      // Should redirect to dashboard after promotion
      cy.url({ timeout: 10_000 }).should('include', '/dashboard');

      // The previously anonymous CV should appear (promoted)
      cy.get('#cv-grid', { timeout: 8_000 }).should('exist');
    });
  });

  // ── 3. Dashboard loads CVs ──────────────────────────────────────────────
  describe('Dashboard CV management', () => {
    beforeEach(() => {
      // Login via API shortcut and visit dashboard
      cy.login(TEST_EMAIL, TEST_PASSWORD);
      cy.visit('/dashboard');
    });

    it('shows the dashboard with at least one CV card', () => {
      cy.get('#cv-grid', { timeout: 8_000 }).should('exist');
      cy.get('[data-cv-id]').should('have.length.at.least', 1);
      cy.get('#user-greeting').should('contain', 'E2E Tester');
    });

    // ── 4. Duplicate CV ──────────────────────────────────────────────────
    it('duplicates a CV and shows the (Copy) card', () => {
      cy.get('[data-cv-id]', { timeout: 8_000 }).first().then(($card) => {
        const cvId = $card.attr('data-cv-id')!;

        cy.get(`[data-testid="duplicate-${cvId}"]`).click();

        // A new card with "(Copy)" in its title should appear
        cy.contains('.cv-title', '(Copy)', { timeout: 8_000 }).should('exist');
      });
    });

    // ── 5. Delete CV ─────────────────────────────────────────────────────
    it('deletes a CV and removes it from the grid', () => {
      cy.get('[data-cv-id]', { timeout: 8_000 }).its('length').then((initialCount) => {
        cy.get('[data-cv-id]').first().then(($card) => {
          const cvId = $card.attr('data-cv-id')!;

          // Stub window.confirm so we don't need a real dialog
          cy.window().then((win) => cy.stub(win, 'confirm').returns(true));

          cy.get(`[data-testid="delete-${cvId}"]`).click();

          // Count should decrease by 1
          cy.get('[data-cv-id]').should('have.length', initialCount - 1);
        });
      });
    });

    // ── 6. New CV creation ────────────────────────────────────────────────
    it('creates a new blank CV from the dashboard', () => {
      cy.get('[data-cv-id]', { timeout: 8_000 }).its('length').then((initialCount) => {
        cy.get('#new-cv-btn').click();
        cy.get('[data-cv-id]').should('have.length', initialCount + 1);
      });
    });
  });

  // ── 6. Auth guard redirect ──────────────────────────────────────────────
  describe('Auth guard', () => {
    it('redirects unauthenticated users from /dashboard to /login', () => {
      // Ensure localStorage is clear
      cy.clearLocalStorage();
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
});
