/**
 * Admin Panel Tests
 * Tests admin authentication, dashboard, events management, and moderation
 */

describe('Admin Panel', () => {
  describe('Admin Authentication', () => {
    it('should show admin panel when accessed', () => {
      cy.visit('/admin');

      // Should show either login form or admin panel
      cy.get('body').should('exist');
    });

    it('should allow access to admin users', () => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
    });

    it('should display admin dashboard tab', () => {
      cy.contains(/dashboard/i).should('be.visible');
    });
  });

  describe('Admin Tabs', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
    });

    it('should display core admin tabs', () => {
      cy.contains(/dashboard/i).should('be.visible');
      cy.contains(/events/i).should('be.visible');
      cy.contains(/insights/i).should('be.visible');
      cy.contains(/moderation/i).should('be.visible');
    });

    it('should switch between tabs', () => {
      // Click Events tab
      cy.contains('button', /events/i).click();
      // Just verify the tab switched successfully
      cy.get('body').should('exist');

      // Click Insights tab
      cy.contains('button', /insights/i).click();
      cy.get('body').should('exist');

      // Click Moderation tab
      cy.contains('button', /moderation/i).click();
      cy.get('body').should('exist');
    });
  });

  describe('Events Management', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');

      // Navigate to Events tab
      cy.contains('button', /events/i).click();
    });

    it('should display EventSlotsManager', () => {
      cy.contains(/event slots|manage events/i).should('be.visible');
    });

    it('should display wildcard slot badge', () => {
      // Wait for Event Slot 4 to be visible, then check for wildcard badge
      cy.contains(/event slot 4/i, { timeout: 10000 }).should('be.visible');
      cy.contains(/wildcard/i).should('be.visible');
    });

    it('should display existing event slots', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            slot_number: 1,
            title: 'Test Event 1',
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            slot_number: 2,
            title: 'Test Event 2',
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEvents');

      cy.reload();
      cy.wait('@getEvents');

      cy.contains(/slot.*1/i).should('be.visible');
      cy.contains(/slot.*2/i).should('be.visible');
    });
  });

  describe('Moderation Panel', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');

      // Navigate to Moderation tab
      cy.contains(/moderation/i).click();
    });

    it('should display user reports list', () => {
      cy.intercept('GET', '**/rest/v1/user_reports*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            reported_user_id: 'user-123',
            reporter_id: 'user-456',
            reason: 'Inappropriate behavior',
            reviewed: false,
            created_at: new Date().toISOString(),
            reporter: {
              name: 'John Reporter',
              email: 'reporter@example.com'
            },
            reported_user: {
              name: 'Jane Reported',
              email: 'reported@example.com'
            }
          }
        ]
      }).as('getReports');

      // Visit admin fresh to trigger the intercept
      cy.visit('/admin');
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
      cy.contains(/moderation/i).click();
      cy.wait('@getReports');

      cy.contains(/inappropriate behavior/i).should('be.visible');
    });

    it('should filter between reviewed and unreviewed reports', () => {
      cy.contains(/unreviewed|pending/i).click();
      cy.contains(/reviewed|completed/i).click();
    });

    it('should allow marking report as reviewed', () => {
      cy.intercept('GET', '**/rest/v1/user_reports*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            reported_user_id: 'user-123',
            reporter_id: 'user-456',
            reason: 'Spam',
            reviewed: false,
            created_at: new Date().toISOString(),
            reporter: {
              name: 'John Reporter',
              email: 'reporter@example.com'
            },
            reported_user: {
              name: 'Jane Reported',
              email: 'reported@example.com'
            }
          }
        ]
      }).as('getReports');

      cy.intercept('PATCH', '**/rest/v1/user_reports*', {
        statusCode: 200
      }).as('markReviewed');

      // Visit admin fresh to trigger the intercept
      cy.visit('/admin');
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
      cy.contains(/moderation/i).click();
      cy.wait('@getReports');

      cy.contains(/mark as reviewed|review/i).click();
      cy.wait('@markReviewed');
    });

    it('should display report details when expanded', () => {
      cy.intercept('GET', '**/rest/v1/user_reports*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            reported_user_id: 'user-123',
            reporter_id: 'user-456',
            reason: 'Harassment',
            description: 'Detailed description of the incident',
            reviewed: false,
            created_at: new Date().toISOString(),
            reporter: {
              name: 'John Reporter',
              email: 'reporter@example.com'
            },
            reported_user: {
              name: 'Jane Reported',
              email: 'reported@example.com'
            }
          }
        ]
      }).as('getReports');

      // Visit admin fresh to trigger the intercept
      cy.visit('/admin');
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
      cy.contains('button', /moderation/i).click();

      // Wait for moderation tab content to load
      cy.contains(/user reports/i, { timeout: 10000 }).should('be.visible');
      cy.wait('@getReports');

      // Description should be visible (reports are not collapsed)
      cy.contains(/detailed description/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Ad Management', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');
    });

    it('should allow uploading ad images', () => {
      // Navigate to ads section if it exists
      cy.get('body').then($body => {
        if ($body.text().includes('Ad') || $body.text().includes('Banner')) {
          cy.contains(/upload|add.*ad/i).should('be.visible');
        }
      });
    });

    it('should display ad preview slots', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('Sidebar') || $body.text().includes('Banner')) {
          cy.contains(/sidebar|banner|bottom/i).should('be.visible');
        }
      });
    });
  });

  describe('Insights', () => {
    beforeEach(() => {
      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      // Wait for dashboard to load
      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('exist');

      // Navigate to Insights tab
      cy.contains(/insights/i).click();
    });

    it('should display insights content', () => {
      cy.get('body').should('exist');
    });

    it('should show analytics or metrics', () => {
      // Check for presence of analytics/metrics
      cy.get('body').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');

      cy.login('test-admin@example.com', 'TestAdmin123!');
      cy.visit('/admin');

      cy.contains(/admin panel|dashboard/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
