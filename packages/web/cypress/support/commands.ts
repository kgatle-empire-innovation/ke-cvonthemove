// ***********************************************
// Custom Cypress commands
// ***********************************************

/**
 * cy.login(email, password)
 * Authenticates via the API directly (no UI interaction), stores the JWT
 * in localStorage so the app picks it up on load.
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const { token, user } = res.body.data;
    window.localStorage.setItem('cvotm_token', token);
    window.localStorage.setItem('cvotm_user', JSON.stringify(user));
  });
});

/**
 * cy.register(email, password, name?)
 * Registers a new user via the API and stores the JWT.
 */
Cypress.Commands.add('register', (email: string, password: string, name?: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: { email, password, name },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(201);
    const { token, user } = res.body.data;
    window.localStorage.setItem('cvotm_token', token);
    window.localStorage.setItem('cvotm_user', JSON.stringify(user));
  });
});

/**
 * cy.createAnonymousCv(sessionId)
 * Hits the wizard PATCH endpoint to seed a CV for an anonymous session.
 */
Cypress.Commands.add('createAnonymousCv', (sessionId: string, title = 'My Test CV') => {
  cy.request({
    method: 'PATCH',
    url: `${Cypress.env('apiUrl')}/cv/wizard`,
    headers: { 'X-Session-ID': sessionId },
    body: { cv: { title, summary: 'E2E test summary' } },
  });
});

// ── TypeScript declaration augmentation ─────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(email: string, password: string, name?: string): Chainable<void>;
      createAnonymousCv(sessionId: string, title?: string): Chainable<void>;
    }
  }
}
