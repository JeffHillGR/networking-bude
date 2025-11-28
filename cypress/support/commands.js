// ***********************************************
// Custom Cypress Commands for BudE Application
// ***********************************************

/**
 * Login command
 * Usage: cy.login('email@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');

  // Open the login modal by clicking "Already a member?" button
  cy.contains(/already a member/i).first().click();

  // Wait for modal to appear and fill in credentials
  cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible').clear().type(email);
  cy.wait(100); // Small delay to ensure password field is ready
  cy.get('input[type="password"]', { timeout: 5000 }).should('be.visible').clear().type(password, { force: true });

  // Intercept the login request to wait for it
  cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');

  // Submit the login form
  cy.get('button[type="submit"]').contains(/login/i).click();

  // Wait for login request to complete
  cy.wait('@loginRequest').then((interception) => {
    cy.log('Login request status:', interception.response.statusCode);
    // Check if login was successful
    if (interception.response.statusCode !== 200) {
      cy.log('Login failed!');
      cy.log('Response:', interception.response.body);
    } else {
      cy.log('Login request succeeded (200)');
    }
  });

  // Check if modal is still visible (indicates login failed)
  cy.get('body').then(($body) => {
    if ($body.find('input[type="email"]').is(':visible')) {
      cy.log('WARNING: Login modal still visible after login attempt');
      // Check for error message
      cy.get('body').invoke('text').then((text) => {
        if (text.includes('Invalid') || text.includes('error')) {
          cy.log('Error message found on page');
        }
      });
    }
  });

  // Wait for successful navigation to dashboard
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
});

/**
 * Logout command
 * Usage: cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Click the user profile button at bottom of sidebar to open dropdown menu
  cy.get('[class*="sidebar"], aside, nav').first().within(() => {
    // Find the button that contains user photo/initials and name (has bg-gray-100 class)
    cy.get('button.bg-gray-100').click();
  });

  // Wait a moment for menu animation
  cy.wait(500);

  // Click "Log Out" in the dropdown menu
  cy.contains('Log Out', { timeout: 5000 }).should('be.visible').click();

  // Verify navigation to home
  cy.url({ timeout: 5000 }).should('eq', Cypress.config().baseUrl + '/');
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
  cy.window().its('localStorage').then(storage => {
    // Look for Supabase auth token key (format: sb-<project-ref>-auth-token)
    const authKey = Object.keys(storage).find(key => key.includes('auth-token'));
    expect(authKey).to.exist;
  });
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
