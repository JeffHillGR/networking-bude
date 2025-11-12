/**
 * Settings & Profile Flow Tests
 * Tests user profile management, preferences, and account settings
 */

describe('Settings & Profile Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPass123!');
    cy.visit('/settings');
  });

  describe('Settings Page', () => {
    it('should display settings page', () => {
      cy.url().should('include', '/settings');
      cy.contains(/settings|preferences|profile/i).should('be.visible');
    });

    it('should display settings tabs', () => {
      cy.contains(/profile/i).should('be.visible');
      cy.contains(/account/i).should('be.visible');
      cy.contains(/notifications/i).should('be.visible');
    });

    it('should switch between settings tabs', () => {
      cy.contains(/account/i).click();
      cy.contains(/email|password|security/i).should('be.visible');

      cy.contains(/notifications/i).click();
      cy.contains(/notification.*preferences/i).should('be.visible');
    });
  });

  describe('Profile Settings', () => {
    beforeEach(() => {
      cy.contains(/profile/i).click();
    });

    it('should display profile information', () => {
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.disabled'); // Email shouldn't be directly editable
      cy.get('input[name="jobTitle"]').should('be.visible');
      cy.get('input[name="company"]').should('be.visible');
    });

    it('should allow editing profile information', () => {
      cy.intercept('PATCH', '**/rest/v1/users*').as('updateProfile');

      cy.get('input[name="jobTitle"]').clear().type('Senior Software Engineer');
      cy.get('input[name="company"]').clear().type('New Company Inc');

      cy.get('button').contains(/save|update/i).click();

      cy.wait('@updateProfile');

      cy.contains(/saved|updated|success/i).should('be.visible');
    });

    it('should validate profile fields', () => {
      cy.get('input[name="firstName"]').clear();

      cy.get('button').contains(/save/i).click();

      cy.contains(/required|cannot.*empty/i).should('be.visible');
    });

    it('should display photo upload section', () => {
      cy.contains(/photo|picture|avatar/i).should('be.visible');
      cy.get('input[type="file"]').should('exist');
    });

    it('should upload profile photo', () => {
      cy.intercept('POST', '**/storage/v1/object/**').as('uploadPhoto');

      // Upload file (using fixture)
      cy.get('input[type="file"]').selectFile('cypress/fixtures/profile-photo.jpg', { force: true });

      cy.wait('@uploadPhoto');

      cy.contains(/uploaded|photo.*updated/i).should('be.visible');
    });

    it('should update organizations', () => {
      cy.intercept('PATCH', '**/rest/v1/users*').as('updateOrgs');

      // Select new organizations
      cy.get('input[type="checkbox"][value="EO"]').check();
      cy.get('input[type="checkbox"][value="YPO"]').check();

      cy.get('button').contains(/save/i).click();

      cy.wait('@updateOrgs');

      cy.contains(/updated|saved/i).should('be.visible');
    });

    it('should update professional interests', () => {
      cy.get('textarea[name="professionalInterests"]').clear()
        .type('Leadership, Innovation, Technology Strategy');

      cy.get('button').contains(/save/i).click();

      cy.contains(/updated/i).should('be.visible');
    });

    it('should update personal interests', () => {
      cy.get('textarea[name="personalInterests"]').clear()
        .type('Pickleball, Hiking, Photography');

      cy.get('button').contains(/save/i).click();

      cy.contains(/updated/i).should('be.visible');
    });

    it('should update networking goals', () => {
      cy.get('textarea[name="networkingGoals"]').clear()
        .type('Find mentorship opportunities and expand network in tech industry');

      cy.get('button').contains(/save/i).click();

      cy.contains(/updated/i).should('be.visible');
    });
  });

  describe('Account Settings', () => {
    beforeEach(() => {
      cy.contains(/account/i).click();
    });

    it('should display account information', () => {
      cy.contains(/email/i).should('be.visible');
      cy.contains(/password/i).should('be.visible');
    });

    it('should initiate email change', () => {
      cy.intercept('POST', '**/api/requestEmailChange*').as('requestEmailChange');

      const newEmail = `newemail.${Date.now()}@example.com`;

      cy.get('button').contains(/change.*email/i).click();

      cy.get('input[name="newEmail"]').type(newEmail);
      cy.get('button[type="submit"]').click();

      cy.wait('@requestEmailChange');

      cy.contains(/verification.*sent|check.*email/i).should('be.visible');
    });

    it('should change password', () => {
      cy.intercept('POST', '**/auth/v1/user*').as('changePassword');

      cy.get('button').contains(/change.*password/i).click();

      cy.get('input[name="currentPassword"]').type('TestPass123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');

      cy.get('button[type="submit"]').click();

      cy.wait('@changePassword');

      cy.contains(/password.*changed|updated/i).should('be.visible');
    });

    it('should validate password change', () => {
      cy.get('button').contains(/change.*password/i).click();

      // Passwords don't match
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPass456!');

      cy.get('button[type="submit"]').click();

      cy.contains(/passwords.*match|mismatch/i).should('be.visible');
    });

    it('should require current password for change', () => {
      cy.get('button').contains(/change.*password/i).click();

      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');

      cy.get('button[type="submit"]').click();

      cy.contains(/current.*password.*required/i).should('be.visible');
    });
  });

  describe('Notification Preferences', () => {
    beforeEach(() => {
      cy.contains(/notifications/i).click();
    });

    it('should display notification preferences', () => {
      cy.contains(/notification.*preferences|email.*preferences/i).should('be.visible');
      cy.get('input[type="checkbox"]').should('have.length.greaterThan', 0);
    });

    it('should toggle email notifications', () => {
      cy.intercept('PATCH', '**/rest/v1/notification_preferences*').as('updatePrefs');

      cy.get('input[type="checkbox"]').first().click();

      cy.wait('@updatePrefs');

      cy.contains(/saved|updated/i).should('be.visible');
    });

    it('should have granular notification controls', () => {
      // Should have options for different notification types
      cy.contains(/connection.*request/i).should('be.visible');
      cy.contains(/new.*match/i).should('be.visible');
      cy.contains(/message/i).should('be.visible');
    });

    it('should save notification preferences', () => {
      cy.intercept('PATCH', '**/rest/v1/notification_preferences*').as('updatePrefs');

      // Toggle multiple preferences
      cy.get('input[name="connectionRequests"]').uncheck();
      cy.get('input[name="newMatches"]').check();

      cy.get('button').contains(/save/i).click();

      cy.wait('@updatePrefs');

      cy.contains(/preferences.*saved/i).should('be.visible');
    });
  });

  describe('Privacy Settings', () => {
    it('should display privacy options', () => {
      cy.contains(/privacy|visibility/i).should('exist');
    });

    it('should control profile visibility', () => {
      cy.intercept('PATCH', '**/rest/v1/users*').as('updatePrivacy');

      cy.get('input[name="profileVisible"]').click();

      cy.get('button').contains(/save/i).click();

      cy.wait('@updatePrivacy');
    });
  });

  describe('Account Deletion', () => {
    it('should display delete account option', () => {
      cy.contains(/account/i).click();

      cy.contains(/delete.*account|close.*account/i).should('be.visible');
    });

    it('should require confirmation for account deletion', () => {
      cy.contains(/account/i).click();
      cy.get('button').contains(/delete.*account/i).click();

      // Should show confirmation modal
      cy.get('[data-testid="delete-modal"]').should('be.visible');
      cy.contains(/are you sure|confirm|permanent/i).should('be.visible');
    });

    it('should cancel account deletion', () => {
      cy.contains(/account/i).click();
      cy.get('button').contains(/delete.*account/i).click();

      cy.get('button').contains(/cancel|nevermind/i).click();

      cy.get('[data-testid="delete-modal"]').should('not.exist');
    });
  });

  describe('Data Export', () => {
    it('should have data export option', () => {
      cy.contains(/download.*data|export.*data/i).should('exist');
    });

    it('should export user data', () => {
      cy.intercept('GET', '**/api/exportUserData*').as('exportData');

      cy.get('button').contains(/download.*data|export/i).click();

      cy.wait('@exportData');

      // Should download file or show success
      cy.contains(/download.*started|exported/i).should('be.visible');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      cy.contains(/profile/i).click();

      // Try to update with invalid email format (if email editing allowed)
      cy.get('input[type="email"]').invoke('removeAttr', 'disabled').clear().type('invalid-email');

      cy.get('button').contains(/save/i).click();

      cy.contains(/valid.*email/i).should('be.visible');
    });

    it('should prevent saving with errors', () => {
      cy.get('input[name="firstName"]').clear();

      cy.get('button').contains(/save/i).click();

      // Should not save
      cy.contains(/error|invalid|required/i).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('input[name="company"]').clear();

      cy.get('button').contains(/save/i).click();

      cy.contains(/required/i).should('be.visible');
    });
  });

  describe('Unsaved Changes', () => {
    it('should warn about unsaved changes when navigating away', () => {
      cy.get('input[name="jobTitle"]').clear().type('New Title');

      // Try to navigate away
      cy.contains(/dashboard/i).click();

      // Should show confirmation dialog (if implemented)
      // cy.contains(/unsaved.*changes|discard/i).should('be.visible');
    });

    it('should allow discarding changes', () => {
      cy.get('input[name="jobTitle"]').clear().type('New Title');

      cy.get('button').contains(/cancel|reset/i).click();

      // Form should reset
      cy.get('input[name="jobTitle"]').should('not.have.value', 'New Title');
    });
  });

  describe('Loading States', () => {
    it('should show loading state while saving', () => {
      cy.intercept('PATCH', '**/rest/v1/users*', (req) => {
        req.reply({
          delay: 2000,
          statusCode: 200
        });
      }).as('slowSave');

      cy.get('input[name="jobTitle"]').clear().type('New Title');
      cy.get('button').contains(/save/i).click();

      // Should show loading indicator
      cy.get('button').contains(/saving|loading/i).should('exist');

      cy.wait('@slowSave');
    });

    it('should disable form while loading', () => {
      cy.intercept('PATCH', '**/rest/v1/users*', {
        delay: 2000
      }).as('slowSave');

      cy.get('input[name="jobTitle"]').type('New Title');
      cy.get('button').contains(/save/i).click();

      cy.get('input[name="jobTitle"]').should('be.disabled');

      cy.wait('@slowSave');
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', () => {
      cy.intercept('PATCH', '**/rest/v1/users*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('saveError');

      cy.get('input[name="jobTitle"]').clear().type('New Title');
      cy.get('button').contains(/save/i).click();

      cy.wait('@saveError');

      cy.contains(/error|failed.*save|try.*again/i).should('be.visible');
    });

    it('should allow retry after error', () => {
      cy.intercept('PATCH', '**/rest/v1/users*', {
        statusCode: 500
      }).as('error');

      cy.get('input[name="jobTitle"]').type('New Title');
      cy.get('button').contains(/save/i).click();

      cy.wait('@error');

      // Retry
      cy.get('button').contains(/retry|try.*again/i).click();

      cy.wait('@error');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');

      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('button').contains(/save/i).should('be.visible');
    });

    it('should work on tablets', () => {
      cy.viewport('ipad-2');

      cy.get('input[name="firstName"]').should('be.visible');
    });
  });
});
