/**
 * Onboarding Flow Tests
 * Tests the multi-step onboarding process for new users
 */

describe('Onboarding Flow', () => {
  const testUser = {
    firstName: 'Cypress',
    lastName: 'Tester',
    email: `cypress.${Date.now()}@example.com`,
    password: 'CypressTest123!',
    jobTitle: 'Software Engineer',
    company: 'Test Company',
    industry: 'Technology',
    zipCode: '12345',
    dob: '1990'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  describe('Personal Information Step', () => {
    it('should display personal information fields', () => {
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });

    it('should validate required personal fields', () => {
      cy.get('button').contains(/next|continue/i).click();

      cy.contains(/required/i).should('be.visible');
    });

    it('should accept valid personal information', () => {
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);

      cy.get('button').contains(/next|continue/i).click();

      // Should move to next step
      cy.contains(/professional|job|career/i).should('be.visible');
    });
  });

  describe('Professional Information Step', () => {
    beforeEach(() => {
      // Fill personal info first
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.get('button').contains(/next|continue/i).click();
    });

    it('should display professional fields', () => {
      cy.get('input[name="jobTitle"]').should('be.visible');
      cy.get('input[name="company"]').should('be.visible');
      cy.contains(/industry/i).should('be.visible');
    });

    it('should validate professional fields', () => {
      cy.get('button').contains(/next|continue/i).click();

      cy.contains(/required/i).should('be.visible');
    });

    it('should accept professional information', () => {
      cy.get('input[name="jobTitle"]').type(testUser.jobTitle);
      cy.get('input[name="company"]').type(testUser.company);

      // Select industry (adjust selector based on implementation)
      cy.get('select[name="industry"]').select(testUser.industry);

      cy.get('button').contains(/next|continue/i).click();

      // Should move to preferences step
      cy.contains(/preferences|interests|goals/i).should('be.visible');
    });
  });

  describe('Preferences & Interests Step', () => {
    beforeEach(() => {
      // Fill previous steps
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.get('button').contains(/next|continue/i).click();

      cy.get('input[name="jobTitle"]').type(testUser.jobTitle);
      cy.get('input[name="company"]').type(testUser.company);
      cy.get('select[name="industry"]').select(testUser.industry);
      cy.get('button').contains(/next|continue/i).click();
    });

    it('should display preferences fields', () => {
      cy.contains(/gender|preferences/i).should('be.visible');
      cy.contains(/year.*born|age/i).should('be.visible');
      cy.contains(/zip.*code|location/i).should('be.visible');
    });

    it('should allow gender preference selection', () => {
      // Select gender preference
      cy.get('select[name="genderPreference"]').should('be.visible');
      cy.get('select[name="genderPreference"]').select('No preference');
    });

    it('should allow age range selection', () => {
      cy.get('input[name="yearBorn"]').type(testUser.dob);
      cy.get('select[name="agePreference"]').select('No Preference');
    });

    it('should allow location input', () => {
      cy.get('input[name="zipCode"]').type(testUser.zipCode);
    });
  });

  describe('Organizations & Interests Step', () => {
    beforeEach(() => {
      // Complete previous steps (simplified)
      cy.completeOnboarding(testUser);
    });

    it('should display organization checkboxes', () => {
      cy.contains(/organizations/i).should('be.visible');

      // Should have multiple organization options
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 5);
    });

    it('should allow multiple organization selections', () => {
      // Select multiple organizations
      cy.get('input[type="checkbox"]').first().check();
      cy.get('input[type="checkbox"]').eq(1).check();
      cy.get('input[type="checkbox"]').eq(2).check();

      // Verify selections
      cy.get('input[type="checkbox"]:checked').should('have.length', 3);
    });

    it('should display professional interests', () => {
      cy.contains(/professional.*interests|skills/i).should('be.visible');
    });

    it('should display personal interests', () => {
      cy.contains(/personal.*interests|hobbies/i).should('be.visible');
    });
  });

  describe('Networking Goals Step', () => {
    beforeEach(() => {
      cy.completeOnboarding(testUser);
    });

    it('should display networking goals field', () => {
      cy.get('textarea[name="networkingGoals"]').should('be.visible');
    });

    it('should accept networking goals text', () => {
      const goals = 'Looking to expand my professional network and find mentorship opportunities';
      cy.get('textarea[name="networkingGoals"]').type(goals);
      cy.get('textarea[name="networkingGoals"]').should('have.value', goals);
    });
  });

  describe('Form Submission', () => {
    it('should complete onboarding and create user account', () => {
      cy.intercept('POST', '**/auth/v1/signup').as('signupRequest');
      cy.intercept('POST', '**/rest/v1/users').as('createProfile');

      cy.completeOnboarding(testUser);

      // Submit final step
      cy.get('button').contains(/submit|complete|finish/i).click();

      // Wait for API calls
      cy.wait('@signupRequest').its('response.statusCode').should('eq', 200);
      cy.wait('@createProfile').its('response.statusCode').should('eq', 201);

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });

    it('should show error if email already exists', () => {
      cy.intercept('POST', '**/auth/v1/signup', {
        statusCode: 400,
        body: {
          error: 'User already registered'
        }
      }).as('signupError');

      cy.completeOnboarding({ ...testUser, email: 'existing@example.com' });

      cy.get('button').contains(/submit|complete/i).click();

      cy.wait('@signupError');

      // Should show error message
      cy.contains(/already.*registered|email.*exists/i).should('be.visible');
    });

    it('should save data to localStorage as backup', () => {
      cy.completeOnboarding(testUser);

      cy.get('button').contains(/submit|complete/i).click();

      // Check localStorage
      cy.window().its('localStorage').invoke('getItem', 'onboardingData').should('exist');
    });
  });

  describe('Navigation & Progress', () => {
    it('should allow going back to previous steps', () => {
      // Go to second step
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.get('button').contains(/next|continue/i).click();

      // Go back
      cy.get('button').contains(/back|previous/i).click();

      // Should be on first step
      cy.get('input[name="firstName"]').should('have.value', testUser.firstName);
    });

    it('should show progress indicator', () => {
      // Should show step progress (e.g., "Step 1 of 5" or progress bar)
      cy.contains(/step.*\d.*of.*\d|progress/i).should('be.visible');
    });

    it('should preserve form data when navigating between steps', () => {
      // Fill first step
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('button').contains(/next/i).click();

      // Go back
      cy.get('button').contains(/back/i).click();

      // Data should be preserved
      cy.get('input[name="firstName"]').should('have.value', testUser.firstName);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      cy.get('label').should('exist');
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
    });

    it('should support keyboard navigation', () => {
      cy.get('input[name="firstName"]').focus().should('have.focus');
      cy.get('input[name="firstName"]').tab();
      cy.get('input[name="lastName"]').should('have.focus');
    });

    it('should have ARIA attributes', () => {
      cy.get('[aria-label], [aria-describedby], [aria-required]').should('exist');
    });
  });
});
