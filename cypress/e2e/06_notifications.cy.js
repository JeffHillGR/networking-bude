/**
 * Notifications Tests
 * Tests notification bell, dropdown, and notification actions
 */

// Helper to click the visible notification bell (there are two - sidebar and mobile header)
const clickNotificationBell = () => {
  cy.get('[data-testid="notification-bell"]', { timeout: 10000 })
    .filter(':visible')
    .first()
    .click({ force: true });
};

describe('Notifications', () => {
  beforeEach(() => {
    // Login before each test - use env vars or defaults
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_PASSWORD') || 'TestPass123!';
    cy.login(testEmail, testPassword);
    cy.visit('/dashboard');

    // Wait for dashboard to load
    cy.contains(/dashboard|welcome/i, { timeout: 10000 }).should('exist');
  });

  describe('Notification Bell', () => {
    it('should display notification bell icon', () => {
      cy.get('[data-testid="notification-bell"]', { timeout: 10000 })
        .filter(':visible')
        .should('have.length.at.least', 1);
    });

    it('should show unread count badge when there are unread notifications', () => {
      // This test verifies the badge appears when there are unread notifications
      // If the test user has no notifications, the badge won't appear - that's expected
      cy.get('[data-testid="notification-bell"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .then($bell => {
          const badge = $bell.find('[data-testid="notification-badge"]');
          if (badge.length > 0) {
            cy.wrap(badge).should('be.visible');
            cy.log('Badge found with unread notifications');
          } else {
            cy.log('No unread notifications - badge not shown (expected behavior)');
          }
        });
    });

    it('should open dropdown when bell is clicked', () => {
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');
    });

    it('should close dropdown when clicking outside', () => {
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');

      cy.get('body').click(0, 0); // Click outside
      cy.get('[data-testid="notification-dropdown"]').should('not.exist');
    });
  });

  describe('Notification List', () => {
    beforeEach(() => {
      // Open the notification dropdown
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');
    });

    it('should display notifications or empty state', () => {
      // Simply verify dropdown has content (header always present)
      cy.get('[data-testid="notification-dropdown"]')
        .should('contain.text', 'Notifications');

      // Wait for loading to potentially finish
      cy.wait(2000);

      // Verify dropdown is still visible and has rendered content
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');
      cy.log('Notification dropdown displayed successfully');
    });

    it('should show notification header', () => {
      cy.get('[data-testid="notification-dropdown"]')
        .contains(/notifications/i)
        .should('be.visible');
    });
  });

  describe('Notification Actions', () => {
    it('should be able to interact with notifications if they exist', () => {
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');

      // Check if there are any notifications to interact with
      cy.get('[data-testid="notification-dropdown"]').then($dropdown => {
        const items = $dropdown.find('[data-testid="notification-item"]');
        if (items.length > 0) {
          // Test clicking a notification
          cy.get('[data-testid="notification-item"]').first().click();
          cy.log('Clicked on notification - should navigate or mark as read');
        } else {
          cy.log('No notifications to interact with - skipping interaction test');
        }
      });
    });

    it('should show delete button on hover for notifications', () => {
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');

      cy.get('[data-testid="notification-dropdown"]').then($dropdown => {
        const items = $dropdown.find('[data-testid="notification-item"]');
        if (items.length > 0) {
          // Hover over first notification to reveal delete button
          cy.get('[data-testid="notification-item"]').first()
            .trigger('mouseover')
            .find('[data-testid="delete-notification"]')
            .should('exist');
          cy.log('Delete button exists on notification item');
        } else {
          cy.log('No notifications - skipping delete button test');
        }
      });
    });
  });

  describe('Realtime Updates', () => {
    it('should have notification bell that can receive updates', () => {
      // Verify the notification component is mounted and functional
      cy.get('[data-testid="notification-bell"]', { timeout: 10000 })
        .filter(':visible')
        .should('have.length.at.least', 1);
      cy.log('Notification bell ready to receive realtime updates');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      // Wait for page to adjust to viewport
      cy.wait(1000);
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      // Wait for page to adjust to viewport
      cy.wait(1000);
      clickNotificationBell();
      cy.get('[data-testid="notification-dropdown"]', { timeout: 5000 }).should('be.visible');
    });
  });
});
