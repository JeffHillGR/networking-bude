// ***********************************************
// Custom Cypress Commands for BudE Application
// ***********************************************

/**
 * Login command
 * Usage: cy.login('email@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button').contains(/sign in|log in/i).click();
  cy.url().should('include', '/dashboard');
});

/**
 * Logout command
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/sign out|logout/i).click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

/**
 * Complete onboarding flow
 * Usage: cy.completeOnboarding(userData)
 */
Cypress.Commands.add('completeOnboarding', (userData = {}) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test.${Date.now()}@example.com`,
    password: 'TestPass123!',
    jobTitle: 'Software Engineer',
    company: 'Test Company',
    industry: 'Technology',
    zipCode: '12345',
    ...userData
  };

  cy.visit('/');

  // Fill out onboarding form (adjust selectors based on actual implementation)
  cy.get('input[name="firstName"]').type(defaultData.firstName);
  cy.get('input[name="lastName"]').type(defaultData.lastName);
  cy.get('input[name="email"]').type(defaultData.email);
  cy.get('input[name="password"]').type(defaultData.password);
  cy.get('input[name="jobTitle"]').type(defaultData.jobTitle);
  cy.get('input[name="company"]').type(defaultData.company);

  // Continue through multi-step form
  cy.get('button').contains(/next|continue/i).click();

  // Add more steps as needed based on actual onboarding flow

  cy.get('button').contains(/submit|complete|finish/i).click();

  return cy.wrap(defaultData);
});

/**
 * Create test user via Supabase API
 * Usage: cy.createTestUser({ email, password })
 */
Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultData = {
    email: `test.${Date.now()}@example.com`,
    password: 'TestPass123!',
    ...userData
  };

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('SUPABASE_URL')}/auth/v1/signup`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY'),
      'Content-Type': 'application/json'
    },
    body: {
      email: defaultData.email,
      password: defaultData.password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return cy.wrap({...defaultData, userId: response.body.user?.id});
  });
});

/**
 * Clean up test user
 * Usage: cy.cleanupTestUser(userId)
 */
Cypress.Commands.add('cleanupTestUser', (userId) => {
  // This requires service role key, typically done in backend test utilities
  cy.log(`Cleanup user: ${userId}`);
  // Implement via API call if service role key available
});

/**
 * Check for element with timeout
 * Usage: cy.waitForElement('[data-testid="dashboard"]')
 */
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

/**
 * Check if user is authenticated
 * Usage: cy.isAuthenticated()
 */
Cypress.Commands.add('isAuthenticated', () => {
  cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token').should('exist');
});

/**
 * Stub Supabase auth
 * Usage: cy.stubAuth()
 */
Cypress.Commands.add('stubAuth', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('onboardingCompleted', 'true');
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: Date.now() + 3600000
    }));
  });
});

/**
 * Intercept Supabase API calls
 * Usage: cy.interceptSupabase()
 */
Cypress.Commands.add('interceptSupabase', () => {
  cy.intercept('POST', '**/auth/v1/**').as('authRequest');
  cy.intercept('GET', '**/rest/v1/**').as('dataRequest');
  cy.intercept('POST', '**/rest/v1/**').as('dataInsert');
  cy.intercept('PATCH', '**/rest/v1/**').as('dataUpdate');
});

/**
 * Wait for all network requests to complete
 * Usage: cy.waitForNetworkIdle()
 */
Cypress.Commands.add('waitForNetworkIdle', (timeout = 1000) => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      let timer;
      const check = () => {
        if (win.performance.getEntriesByType('resource').length === 0) {
          clearTimeout(timer);
          resolve();
        } else {
          timer = setTimeout(check, timeout);
        }
      };
      check();
    });
  });
});
