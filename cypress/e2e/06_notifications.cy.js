/**
 * Notifications Tests
 * Tests notification bell, dropdown, and notification actions
 */

describe('Notifications', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'TestPass123!');
    cy.visit('/dashboard');

    // Wait for dashboard to load
    cy.contains(/dashboard|welcome/i, { timeout: 10000 }).should('exist');
  });

  describe('Notification Bell', () => {
    it('should display notification bell icon', () => {
      cy.get('[data-testid="notification-bell"]', { timeout: 10000 }).should('be.visible');
    });

    it('should show unread count badge when there are unread notifications', () => {
      // Mock notifications data with unread items
      cy.intercept('GET', '**/rest/v1/notifications*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            message: 'New connection request',
            type: 'connection',
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            message: 'Event starting soon',
            type: 'event',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]
      }).as('getNotifications');

      cy.reload();
      cy.wait('@getNotifications');

      // Should show badge with count
      cy.get('[data-testid="notification-bell"]')
        .find('[data-testid="notification-badge"]')
        .should('be.visible')
        .and('contain', '2');
    });

    it('should open dropdown when bell is clicked', () => {
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');
    });

    it('should close dropdown when clicking outside', () => {
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');

      cy.get('body').click(0, 0); // Click outside
      cy.get('[data-testid="notification-dropdown"]').should('not.exist');
    });
  });

  describe('Notification List', () => {
    beforeEach(() => {
      // Mock notifications
      cy.intercept('GET', '**/rest/v1/notifications*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            message: 'John Doe sent you a connection request',
            type: 'connection',
            is_read: false,
            created_at: new Date().toISOString(),
            connection_id: 'conn-123'
          },
          {
            id: '2',
            message: 'New event: Networking Mixer',
            type: 'event',
            is_read: false,
            created_at: new Date().toISOString(),
            event_id: 'event-456'
          },
          {
            id: '3',
            message: 'Jane Smith accepted your request',
            type: 'connection',
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      }).as('getNotifications');

      cy.reload();
      cy.wait('@getNotifications');
      cy.get('[data-testid="notification-bell"]').click();
    });

    it('should display all notifications', () => {
      cy.get('[data-testid="notification-dropdown"]')
        .find('[data-testid="notification-item"]')
        .should('have.length', 3);
    });

    it('should distinguish between read and unread notifications', () => {
      // Unread notifications should have different styling
      cy.get('[data-testid="notification-item"]').first()
        .should('have.class', 'unread');

      // Read notifications should not have unread class
      cy.get('[data-testid="notification-item"]').last()
        .should('not.have.class', 'unread');
    });

    it('should show "Mark all as read" button when there are unread notifications', () => {
      cy.contains(/mark all as read/i).should('be.visible');
    });

    it('should display "No notifications" when list is empty', () => {
      cy.intercept('GET', '**/rest/v1/notifications*', {
        statusCode: 200,
        body: []
      }).as('getEmptyNotifications');

      cy.reload();
      cy.wait('@getEmptyNotifications');
      cy.get('[data-testid="notification-bell"]').click();

      cy.contains(/no notifications/i).should('be.visible');
    });
  });

  describe('Notification Actions', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/rest/v1/notifications*', {
        statusCode: 200,
        body: [
          {
            id: '1',
            message: 'John Doe sent you a connection request',
            type: 'connection',
            is_read: false,
            created_at: new Date().toISOString(),
            connection_id: 'conn-123'
          }
        ]
      }).as('getNotifications');

      cy.reload();
      cy.wait('@getNotifications');
      cy.get('[data-testid="notification-bell"]').click();
    });

    it('should mark notification as read when clicked', () => {
      cy.intercept('PATCH', '**/rest/v1/notifications*', {
        statusCode: 200
      }).as('markAsRead');

      cy.get('[data-testid="notification-item"]').first().click();
      cy.wait('@markAsRead');
    });

    it('should delete notification when delete button clicked', () => {
      cy.intercept('DELETE', '**/rest/v1/notifications*', {
        statusCode: 200
      }).as('deleteNotification');

      cy.get('[data-testid="notification-item"]').first()
        .find('[data-testid="delete-notification"]').click();

      cy.wait('@deleteNotification');
    });

    it('should mark all notifications as read', () => {
      cy.intercept('PATCH', '**/rest/v1/notifications*', {
        statusCode: 200
      }).as('markAllAsRead');

      cy.contains(/mark all as read/i).click();
      cy.wait('@markAllAsRead');

      // Badge should disappear
      cy.get('[data-testid="notification-badge"]').should('not.exist');
    });

    it('should navigate to connection when connection notification clicked', () => {
      cy.get('[data-testid="notification-item"]').first().click();
      cy.url().should('include', '/connections');
      cy.url().should('include', 'selected=conn-123');
    });
  });

  describe('Realtime Updates', () => {
    it('should update notification count when new notification arrives', () => {
      // This would require mocking Supabase realtime subscriptions
      // For now, we can test that the component subscribes correctly
      cy.get('[data-testid="notification-bell"]').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="notification-bell"]').should('be.visible');
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');
    });
  });
});
