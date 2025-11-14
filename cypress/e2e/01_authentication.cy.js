/**
 * Authentication Flow Tests
 * Tests user signup, login, logout, and password reset
 */

describe('Authentication Flow', () => {
  const testEmail = `test.${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Signup', () => {
    it('should display the signup/onboarding form', () => {
      cy.get('form').should('be.visible');
      cy.contains(/sign up|get started|create account/i).should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.contains(/required|please fill/i).should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();

      cy.contains(/valid email|email format/i).should('be.visible');
    });

    it('should validate password strength', () => {
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type('weak');
      cy.get('button[type="submit"]').click();

      // Should require stronger password
      cy.contains(/password.*strong|minimum.*characters/i).should('be.visible');
    });

    it('should successfully create a new account', () => {
      cy.intercept('POST', '**/auth/v1/signup').as('signupRequest');

      // Fill out signup form (adjust selectors based on actual form)
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);

      // Submit
      cy.get('button[type="submit"]').click();

      // Wait for signup request
      cy.wait('@signupRequest').its('response.statusCode').should('eq', 200);

      // Should redirect to onboarding or dashboard
      cy.url().should('match', /\/dashboard|\/onboarding/);
    });
  });

  describe('User Login', () => {
    // Use existing test account
    const existingEmail = 'test@example.com';
    const existingPassword = 'TestPass123!';

    it('should display login form', () => {
      cy.contains(/sign in|log in/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');

      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button').contains(/sign in|log in/i).click();

      cy.wait('@loginRequest');

      // Should show error message
      cy.contains(/invalid.*credentials|incorrect.*password/i).should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');

      cy.get('input[type="email"]').type(existingEmail);
      cy.get('input[type="password"]').type(existingPassword);
      cy.get('button').contains(/sign in|log in/i).click();

      cy.wait('@loginRequest');

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Should store auth token
      cy.isAuthenticated();
    });

    it('should support "Remember Me" functionality', () => {
      cy.get('input[type="checkbox"]').check(); // Remember me checkbox
      cy.get('input[type="email"]').type(existingEmail);
      cy.get('input[type="password"]').type(existingPassword);
      cy.get('button').contains(/sign in|log in/i).click();

      cy.url().should('include', '/dashboard');

      // Check that rememberMe is set
      cy.window().its('localStorage').invoke('getItem', 'rememberMe').should('eq', 'true');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Login first
      cy.login('test@example.com', 'TestPass123!');
    });

    it('should successfully log out user', () => {
      // Find and click logout button
      cy.get('button').contains(/sign out|logout/i).click();

      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Should clear auth tokens
      cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token').should('not.exist');
    });

    it('should clear session data on logout', () => {
      cy.logout();

      // Check that session data is cleared
      cy.window().its('localStorage').invoke('getItem', 'onboardingCompleted').should('not.exist');
      cy.window().its('localStorage').invoke('getItem', 'lastActivity').should('not.exist');
    });
  });

  describe('Password Reset', () => {
    it('should display password reset form', () => {
      cy.contains(/forgot password|reset password/i).click();

      cy.url().should('include', '/reset-password');
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should send password reset email', () => {
      cy.intercept('POST', '**/auth/v1/recover').as('resetRequest');

      cy.visit('/reset-password');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetRequest').its('response.statusCode').should('eq', 200);

      // Should show success message
      cy.contains(/check your email|reset link sent/i).should('be.visible');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'TestPass123!');
    });

    it('should track user activity', () => {
      // Check that lastActivity is set
      cy.window().its('localStorage').invoke('getItem', 'lastActivity').should('exist');

      // Interact with page
      cy.get('body').click();

      // Activity timestamp should update
      cy.wait(5000); // Wait for activity throttle
      cy.get('body').click();

      cy.window().its('localStorage').invoke('getItem', 'lastActivity').then((timestamp) => {
        expect(parseInt(timestamp)).to.be.greaterThan(Date.now() - 10000);
      });
    });

    it('should maintain session on page refresh', () => {
      cy.reload();

      // Should still be logged in
      cy.url().should('include', '/dashboard');
      cy.isAuthenticated();
    });
  });
});
