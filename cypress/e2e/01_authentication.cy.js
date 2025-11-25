/**
 * Authentication Flow Tests
 * Tests user signup, login, logout, and password reset for the Networking Bude app
 */

describe('Authentication Flow', () => {
  const testEmail = `test.${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!@#';
  const existingEmail = 'test@example.com';
  const existingPassword = 'TestPass123!';

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Landing Page', () => {
    it('should display the landing hero with carousel', () => {
      // Should show hero carousel
      cy.get('img[alt*="banner"]').should('be.visible');

      // Should have main CTA buttons
      cy.contains(/check it out|join now/i).should('be.visible');
      cy.contains(/already a member/i).should('be.visible');
    });

    it('should navigate to signup when clicking Check It Out', () => {
      cy.contains(/check it out|join now/i).click();

      // Should show the signup form (Welcome step)
      cy.contains(/let's set up your profile/i).should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
    });

    it('should open login modal when clicking Already a Member', () => {
      cy.contains(/already a member/i).click();

      // Should show login modal
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains(/sign in|log in/i).should('be.visible');
    });
  });

  describe('User Signup - Welcome Step (Step 0)', () => {
    beforeEach(() => {
      cy.contains(/check it out|join now/i).click();
    });

    it('should display the welcome/signup form with all required fields', () => {
      cy.contains(/let's set up your profile/i).should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains(/continue|next/i).should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit without filling fields
      cy.contains('button', /continue|next/i).click();

      // Form should not progress (still on step 0)
      cy.get('input[name="firstName"]').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      // Should show validation error or not progress
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should validate password requirements', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type('weak');

      // Password requirements should be visible
      cy.contains(/12 characters|uppercase|lowercase|number|special/i).should('be.visible');

      cy.contains('button', /continue|next/i).click();

      // Should not progress to next step
      cy.get('input[name="firstName"]').should('be.visible');
    });

    it('should show/hide password when clicking eye icon', () => {
      cy.get('input[type="password"]').should('exist');

      // Click eye icon to show password
      cy.get('input[type="password"]').parent().find('button').click();
      cy.get('input[type="text"]').should('exist');

      // Click again to hide password
      cy.get('input[type="text"]').parent().find('button').click();
      cy.get('input[type="password"]').should('exist');
    });

    it('should progress to Step 1 with valid information', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      // Should progress to professional information step
      cy.contains(/job title|professional information/i).should('be.visible');
      cy.get('input[name="jobTitle"]').should('be.visible');
    });
  });

  describe('User Signup - Professional Information (Step 1)', () => {
    beforeEach(() => {
      cy.contains(/check it out|join now/i).click();

      // Fill welcome step
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      // Wait for Step 1 to load
      cy.get('input[name="jobTitle"]').should('be.visible');
    });

    it('should display professional information form', () => {
      cy.get('input[name="jobTitle"]').should('be.visible');
      cy.get('input[name="company"]').should('be.visible');
      cy.get('input[name="zipCode"]').should('be.visible');
      cy.get('select[name="industry"]').should('be.visible');
    });

    it('should validate required zip code field', () => {
      cy.contains('button', /continue|next/i).click();

      // Should still be on Step 1
      cy.get('input[name="zipCode"]').should('be.visible');
    });

    it('should show job title autocomplete suggestions', () => {
      cy.get('input[name="jobTitle"]').type('Software');

      // Should show suggestions dropdown
      cy.get('div').contains(/engineer|developer/i).should('be.visible');
    });

    it('should progress to Step 2 with required fields filled', () => {
      cy.get('input[name="jobTitle"]').type('Software Engineer');
      cy.get('input[name="company"]').type('Tech Corp');
      cy.get('input[name="zipCode"]').scrollIntoView().type('49503');
      cy.get('select[name="industry"]').select('technology');

      cy.contains('button', /continue|next/i).click();

      // Should progress to goals step
      cy.get('textarea[name="networkingGoals"]').should('be.visible');
    });

    it('should allow back navigation to Welcome step', () => {
      cy.contains('button', /back|previous/i).click();

      // Should return to Step 0
      cy.get('input[name="firstName"]').should('be.visible');
    });
  });

  describe('User Signup - Goals & Interests (Step 2)', () => {
    beforeEach(() => {
      cy.contains(/check it out|join now/i).click();

      // Use custom command to fill Steps 0 & 1
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      cy.get('input[name="jobTitle"]').type('Software Engineer');
      cy.get('input[name="zipCode"]').scrollIntoView().type('49503');
      cy.contains('button', /continue|next/i).click();

      // Wait for Step 2 to load
      cy.get('textarea[name="networkingGoals"]').should('be.visible');
    });

    it('should display goals and interests form', () => {
      cy.get('textarea[name="networkingGoals"]').should('be.visible');
      cy.get('textarea[name="personalInterests"]').should('be.visible');
      cy.contains(/create account|complete|finish/i).should('be.visible');
    });

    it('should validate required networking goals field', () => {
      cy.contains('button', /create account|complete/i).click();

      // Should still be on Step 2
      cy.get('textarea[name="networkingGoals"]').should('be.visible');
    });

    it('should enforce character limits on textareas', () => {
      const longText = 'a'.repeat(600);
      cy.get('textarea[name="networkingGoals"]').type(longText);
      cy.get('textarea[name="networkingGoals"]').invoke('val').then(val => {
        expect(val.length).to.be.lte(500);
      });
    });

    it('should successfully create account and redirect to dashboard', () => {
      cy.intercept('POST', '**/auth/v1/signup').as('signupRequest');
      cy.intercept('POST', '**/rest/v1/users').as('profileCreate');

      cy.get('textarea[name="networkingGoals"]').type('I want to expand my professional network and find mentorship opportunities.');
      cy.get('textarea[name="personalInterests"]').type('Hiking, reading, and learning new technologies.');

      cy.contains('button', /create account|complete/i).click();

      // Wait for signup requests
      cy.wait('@signupRequest').its('response.statusCode').should('eq', 200);

      // Should show success popup
      cy.contains(/success|welcome/i, { timeout: 5000 }).should('be.visible');

      // Should redirect to dashboard
      cy.url({ timeout: 15000 }).should('include', '/dashboard');
      cy.isAuthenticated();
    });

    it('should allow photo upload', () => {
      cy.get('input[type="file"]').should('exist');

      // Note: Actual file upload testing would require fixture file
      // cy.get('input[type="file"]').selectFile('cypress/fixtures/profile-photo.jpg');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      cy.contains(/already a member/i).click();
      // Wait for modal to appear
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should display login modal with email and password fields', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains('button', /sign in|log in/i).should('be.visible');
      cy.contains(/forgot password/i).should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');

      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.contains('button', /sign in|log in/i).click();

      cy.wait('@loginRequest');

      // Should show error message
      cy.contains(/invalid.*password|error/i, { timeout: 5000 }).should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');

      cy.get('input[type="email"]').type(existingEmail);
      cy.get('input[type="password"]').type(existingPassword);
      cy.contains('button', /sign in|log in/i).click();

      cy.wait('@loginRequest');

      // Should redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
      cy.isAuthenticated();
    });

    it('should toggle password visibility', () => {
      cy.get('input[type="password"]').should('exist');

      // Click eye icon to show password
      cy.get('input[type="password"]').parent().find('button').first().click();
      cy.get('input[type="text"]').should('exist');

      // Click again to hide
      cy.get('input[type="text"]').parent().find('button').first().click();
      cy.get('input[type="password"]').should('exist');
    });

    it('should close modal when clicking outside or close button', () => {
      // Close modal (click backdrop or X button)
      cy.get('body').type('{esc}');

      // Modal should be closed, landing page visible
      cy.contains(/check it out|join now/i).should('be.visible');
    });
  });

  describe('Password Reset', () => {
    beforeEach(() => {
      cy.contains(/already a member/i).click();
      cy.get('input[type="email"]').should('be.visible');
      cy.contains(/forgot password/i).click();
    });

    it('should display forgot password modal', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.contains('button', /send reset link|reset/i).should('be.visible');
    });

    it('should require valid email address', () => {
      cy.contains('button', /send reset link|reset/i).click();

      // Should still show form (validation failed)
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should send password reset email successfully', () => {
      cy.intercept('POST', '**/auth/v1/recover').as('resetRequest');

      cy.get('input[type="email"]').type(existingEmail);
      cy.contains('button', /send reset link|reset/i).click();

      cy.wait('@resetRequest').its('response.statusCode').should('eq', 200);

      // Should show success message
      cy.contains(/check your.*email|reset.*sent/i, { timeout: 5000 }).should('be.visible');
    });

    it('should handle reset for non-existent email gracefully', () => {
      cy.intercept('POST', '**/auth/v1/recover').as('resetRequest');

      cy.get('input[type="email"]').type('nonexistent@example.com');
      cy.contains('button', /send reset link|reset/i).click();

      cy.wait('@resetRequest');

      // Supabase typically shows success message regardless for security
      cy.contains(/check your.*email|reset.*sent/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Login using custom command
      cy.login(existingEmail, existingPassword);
      cy.url().should('include', '/dashboard');
    });

    it('should successfully log out user', () => {
      // Find and click logout button (likely in header/nav)
      cy.get('button').contains(/sign out|logout|log out/i).click();

      // Should redirect to home page
      cy.url({ timeout: 5000 }).should('eq', Cypress.config().baseUrl + '/');

      // Should clear auth tokens
      cy.window().its('localStorage').then(storage => {
        const authKey = Object.keys(storage).find(key => key.includes('supabase.auth.token'));
        expect(authKey).to.be.undefined;
      });
    });

    it('should clear session data on logout', () => {
      cy.logout();

      // Check that session data is cleared
      cy.window().its('localStorage').invoke('getItem', 'onboardingCompleted').should('not.exist');
    });

    it('should redirect to home when accessing protected route after logout', () => {
      cy.logout();

      // Try to access dashboard
      cy.visit('/dashboard');

      // Should redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      cy.login(existingEmail, existingPassword);
    });

    it('should maintain session on page refresh', () => {
      cy.reload();

      // Should still be logged in
      cy.url().should('include', '/dashboard');
      cy.isAuthenticated();
    });

    it('should maintain session when navigating between routes', () => {
      cy.isAuthenticated();

      // Navigate to different routes
      cy.visit('/events');
      cy.url().should('include', '/events');
      cy.isAuthenticated();

      cy.visit('/settings');
      cy.url().should('include', '/settings');
      cy.isAuthenticated();

      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.isAuthenticated();
    });

    it('should persist authentication in localStorage', () => {
      cy.window().its('localStorage').then(storage => {
        const authKey = Object.keys(storage).find(key => key.includes('supabase.auth.token'));
        expect(authKey).to.exist;

        const authData = JSON.parse(storage[authKey]);
        expect(authData).to.have.property('access_token');
        expect(authData).to.have.property('refresh_token');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to home', () => {
      const protectedRoutes = ['/dashboard', '/events', '/settings'];

      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('eq', Cypress.config().baseUrl + '/');
      });
    });

    it('should allow authenticated users to access protected routes', () => {
      cy.login(existingEmail, existingPassword);

      const protectedRoutes = ['/dashboard', '/events', '/settings'];

      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
      });
    });
  });

  describe('Edge Cases & Error Handling', () => {
    beforeEach(() => {
      cy.contains(/check it out|join now/i).click();
    });

    it('should handle duplicate email registration', () => {
      cy.intercept('POST', '**/auth/v1/signup').as('signupRequest');

      // Fill form with existing email
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(existingEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      cy.get('input[name="jobTitle"]').type('Engineer');
      cy.get('input[name="zipCode"]').scrollIntoView().type('49503');
      cy.contains('button', /continue|next/i).click();

      cy.get('textarea[name="networkingGoals"]').type('Test goals');
      cy.get('textarea[name="personalInterests"]').type('Test interests');
      cy.contains('button', /create account|complete/i).click();

      cy.wait('@signupRequest');

      // Should show error about existing user
      cy.contains(/already.*exists|already.*registered/i, { timeout: 5000 }).should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/auth/v1/signup', {
        statusCode: 500,
        body: { error: 'Network error' }
      }).as('failedSignup');

      // Complete full form
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="email"]').type(testEmail);
      cy.get('input[type="password"]').type(testPassword);
      cy.contains('button', /continue|next/i).click();

      cy.get('input[name="zipCode"]').scrollIntoView().type('49503');
      cy.contains('button', /continue|next/i).click();

      cy.get('textarea[name="networkingGoals"]').type('Goals');
      cy.get('textarea[name="personalInterests"]').type('Interests');
      cy.contains('button', /create account|complete/i).click();

      cy.wait('@failedSignup');

      // Should show error message
      cy.contains(/error|failed|try again/i, { timeout: 5000 }).should('be.visible');
    });
  });
});
