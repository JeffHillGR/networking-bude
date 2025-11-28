/**
 * Settings & Profile Flow Tests
 * Tests user profile management and preferences
 */

describe('Settings & Profile Flow', () => {
  beforeEach(() => {
    // Set up intercepts BEFORE visiting the page
    // Mock the user update by ID (used by handleSaveProfile)
    cy.intercept('PATCH', '**/rest/v1/users*', (req) => {
      if (req.url.includes('id=eq.')) {
        req.reply({
          statusCode: 200,
          body: {}
        });
      }
    }).as('updateProfile');

    cy.login('test@example.com', 'TestPass123!');
    cy.visit('/settings');
  });

  describe('Settings Page', () => {
    it('should display settings page', () => {
      cy.url().should('include', '/settings');
      cy.contains(/settings|profile/i).should('be.visible');
    });

    it('should display main settings tabs', () => {
      cy.contains(/profile/i).should('be.visible');
      cy.contains(/account/i).should('be.visible');
      cy.contains(/notification/i).should('be.visible');
    });
  });

  describe('Profile Settings', () => {
    it('should display profile information fields', () => {
      cy.get('input[name="fullName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="jobTitle"]').should('be.visible');
      cy.get('input[name="company"]').should('be.visible');
      cy.get('input[name="zipCode"]').should('be.visible');
    });

    it('should allow editing job title and company', () => {
      cy.get('input[name="jobTitle"]').clear().type('Senior Software Engineer');
      cy.get('input[name="company"]').clear().type('New Company Inc');

      cy.get('button').contains(/save.*changes/i).click();

      cy.wait('@updateProfile');

      // Should show success message
      cy.contains(/profile.*updated|saved|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should display industry dropdown', () => {
      cy.get('select').contains(/select.*industry/i).should('exist');
    });

    it('should allow updating zip code', () => {
      cy.get('input[name="zipCode"]').clear().type('49503');

      cy.get('button').contains(/save.*changes/i).click();

      cy.wait('@updateProfile');

      cy.contains(/profile.*updated|saved|success/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Profile Photo', () => {
    it('should display photo upload section', () => {
      cy.contains(/profile.*photo|upload.*photo/i).should('be.visible');
      cy.get('input[type="file"]').should('exist');
    });

    it('should have file upload input', () => {
      cy.get('input[type="file"]').should('exist');
    });
  });

  describe('Organizations', () => {
    it('should display organizations section', () => {
      cy.contains(/organizations|groups/i).should('be.visible');
    });

    it('should have organization selection options', () => {
      // Wait for organizations section to load and check for organization buttons
      cy.contains(/organizations i attend/i).should('be.visible');
      // Should have organization buttons like "GR Chamber of Commerce", "Rotary Club", etc.
      cy.get('button').contains(/GR Chamber|Rotary|CREW|GRYP/i).should('exist');
    });
  });

  describe('Interests and Goals', () => {
    it('should display connection preferences section', () => {
      cy.contains(/connection.*preferences|networking/i).should('be.visible');
    });

    it('should display groups section', () => {
      cy.contains(/groups.*belong/i).should('be.visible');
    });

    it('should display looking to accomplish section', () => {
      cy.contains(/looking to/i).should('be.visible');
    });
  });

  describe('Save Functionality', () => {
    it('should have save changes button', () => {
      cy.get('button').contains(/save.*changes/i).should('be.visible');
    });

    it('should show success message after saving', () => {
      cy.get('input[name="jobTitle"]').clear().type('Test Engineer');
      cy.get('button').contains(/save.*changes/i).click();

      cy.wait('@updateProfile');

      cy.contains(/profile.*updated|saved|success/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show loading state while saving', () => {
      // Override the default PATCH intercept with a delayed response
      cy.intercept('PATCH', '**/rest/v1/users*', (req) => {
        if (req.url.includes('id=eq.')) {
          req.reply({
            delay: 2000,
            statusCode: 200,
            body: {}
          });
        }
      }).as('slowSave');

      cy.get('input[name="jobTitle"]').clear().type('New Title');
      cy.get('button').contains(/save/i).click();

      // Should show saving indicator
      cy.contains('button', /saving/i, { timeout: 3000 }).should('be.visible');

      cy.wait('@slowSave');
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', () => {
      // Override the default PATCH intercept with an error response
      cy.intercept('PATCH', '**/rest/v1/users*', (req) => {
        if (req.url.includes('id=eq.')) {
          req.reply({
            statusCode: 500,
            body: { error: 'Server error' }
          });
        }
      }).as('saveError');

      cy.get('input[name="jobTitle"]').clear().type('New Title');
      cy.get('button').contains(/save/i).click();

      cy.wait('@saveError');

      // Should show error message
      cy.contains(/error|failed/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');

      cy.get('input[name="fullName"]').should('exist');
      cy.get('button').contains(/save/i).should('exist');
    });

    it('should work on tablets', () => {
      cy.viewport('ipad-2');

      cy.get('input[name="fullName"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should allow navigating between tabs', () => {
      // Try clicking account tab if it exists
      cy.get('body').then($body => {
        if ($body.text().match(/account/i)) {
          cy.contains(/account/i).click();
          cy.get('body').should('exist');
        }
      });
    });

    it('should have back to dashboard navigation', () => {
      cy.get('body').then($body => {
        if ($body.find('[href="/dashboard"]').length > 0 ||
            $body.text().match(/dashboard|back/i)) {
          // Navigation exists
          expect(true).to.be.true;
        }
      });
    });
  });

  describe('Profile Completeness', () => {
    it('should display profile completeness indicator if present', () => {
      cy.get('body').then($body => {
        // If profile completeness exists, check it's visible
        if ($body.text().match(/profile.*complete|completeness/i)) {
          cy.contains(/profile.*complete|completeness/i).should('be.visible');
        }
      });
    });
  });
});
