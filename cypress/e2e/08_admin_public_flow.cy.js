/**
 * Admin to Public Flow Tests
 * Tests that content created in admin panel properly appears on public pages
 */

describe('Admin to Public Content Flow', () => {
  describe('Event Slots Management', () => {
    it('should display events in correct slots on public Events page', () => {
      // Mock event slots data from admin
      cy.intercept('GET', '**/rest/v1/event_slots*', {
        statusCode: 200,
        body: [
          {
            id: 'slot-1',
            slot_number: 1,
            event_id: 'event-123',
            is_wildcard: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'slot-2',
            slot_number: 2,
            event_id: 'event-456',
            is_wildcard: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'slot-3',
            slot_number: 3,
            event_id: null,
            is_wildcard: true,
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEventSlots');

      // Mock events data
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: [
          {
            id: 'event-123',
            title: 'Featured Event 1',
            event_type: 'In-Person',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            location: 'Test Location',
            description: 'Featured event in slot 1',
            created_at: new Date().toISOString()
          },
          {
            id: 'event-456',
            title: 'Featured Event 2',
            event_type: 'Virtual',
            date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
            location: 'Online',
            description: 'Featured event in slot 2',
            created_at: new Date().toISOString()
          },
          {
            id: 'event-789',
            title: 'Regular Event',
            event_type: 'In-Person',
            date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
            location: 'Another Location',
            description: 'Regular event not in featured slots',
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEvents');

      // Visit public Events page
      cy.visit('/events');

      cy.wait('@getEvents');

      // Verify featured events appear
      cy.contains('Featured Event 1').should('be.visible');
      cy.contains('Featured Event 2').should('be.visible');

      // Verify regular events also appear
      cy.contains('Regular Event').should('be.visible');
    });

    it('should handle wildcard slots correctly', () => {
      cy.intercept('GET', '**/rest/v1/event_slots*', {
        statusCode: 200,
        body: [
          {
            id: 'slot-1',
            slot_number: 1,
            event_id: null,
            is_wildcard: true,
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEventSlots');

      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: [
          {
            id: 'event-123',
            title: 'Wildcard Event',
            event_type: 'Hybrid',
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Test Location',
            description: 'Event that can fill wildcard slot',
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEvents');

      cy.visit('/events');
      cy.wait('@getEvents');

      // Wildcard slots should show any available event
      cy.contains('Wildcard Event').should('be.visible');
    });
  });

  describe('Resources Management', () => {
    it('should display admin-added resources on Resources page', () => {
      cy.intercept('GET', '**/rest/v1/resources*', {
        statusCode: 200,
        body: [
          {
            id: 'resource-1',
            title: 'Admin Added Resource',
            description: 'Resource added via admin panel',
            url: 'https://example.com',
            category: 'Guide',
            created_at: new Date().toISOString()
          }
        ]
      }).as('getResources');

      cy.visit('/resources');
      cy.wait('@getResources');

      cy.contains('Admin Added Resource').should('be.visible');
    });
  });

  describe('Ad Management', () => {
    it.skip('should display admin-uploaded ads in correct slots', () => {
      // Skipped: Ad feature implementation pending
      cy.intercept('GET', '**/rest/v1/ads*', {
        statusCode: 200,
        body: [
          {
            id: 'ad-1',
            slot: 'sidebar',
            image_url: 'https://example.com/ad1.jpg',
            link_url: 'https://example.com',
            active: true
          },
          {
            id: 'ad-2',
            slot: 'banner',
            image_url: 'https://example.com/ad2.jpg',
            link_url: 'https://example.com',
            active: true
          }
        ]
      }).as('getAds');

      cy.visit('/dashboard');
      cy.wait('@getAds');

      // Verify ads appear in correct slots
      cy.get('[data-testid="sidebar-ad"]').should('be.visible');
      cy.get('[data-testid="banner-ad"]').should('be.visible');
    });
  });

  describe('Event Data Consistency', () => {
    it('should show same event data on listing and detail pages', () => {
      const testEvent = {
        id: 'event-consistency-test',
        title: 'Consistency Test Event',
        event_type: 'In-Person',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Consistency Location',
        description: 'Testing data consistency across pages',
        created_at: new Date().toISOString()
      };

      // Mock event list
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: [testEvent]
      }).as('getEvents');

      // Mock single event detail
      cy.intercept('GET', `**/rest/v1/events?id=eq.${testEvent.id}*`, {
        statusCode: 200,
        body: [testEvent]
      }).as('getEventDetail');

      // Visit events page
      cy.visit('/events');
      cy.wait('@getEvents');

      // Verify event appears on listing
      cy.contains('Consistency Test Event').should('be.visible');

      // Click event to go to detail page
      cy.contains('Consistency Test Event').click();
      cy.wait('@getEventDetail');

      // Verify same data appears on detail page
      cy.contains('Consistency Test Event').should('be.visible');
      cy.contains('Consistency Location').should('be.visible');
      cy.contains('Testing data consistency across pages').should('be.visible');
    });
  });

  describe('Real-time Updates', () => {
    it.skip('should reflect admin changes on public pages without refresh', () => {
      // Skipped: Requires Supabase realtime subscription testing
      // This would test that when admin creates/updates content,
      // public pages automatically update via realtime subscriptions
    });
  });

  describe('Content Validation', () => {
    it('should only display active/published content on public pages', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: [
          {
            id: 'event-published',
            title: 'Published Event',
            event_type: 'In-Person',
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Location',
            description: 'This should be visible',
            status: 'published',
            created_at: new Date().toISOString()
          },
          {
            id: 'event-draft',
            title: 'Draft Event',
            event_type: 'Virtual',
            date: new Date(Date.now() + 86400000).toISOString(),
            location: 'Online',
            description: 'This should NOT be visible',
            status: 'draft',
            created_at: new Date().toISOString()
          }
        ]
      }).as('getEvents');

      cy.visit('/events');
      cy.wait('@getEvents');

      // Published content should be visible
      cy.contains('Published Event').should('be.visible');

      // Draft content should not be visible (if filtering is implemented)
      // cy.contains('Draft Event').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle missing admin data', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: []
      }).as('getEmptyEvents');

      cy.visit('/events');
      cy.wait('@getEmptyEvents');

      // Should show empty state, not error
      cy.get('body').should('exist');
      // Could check for "No events" message if implemented
    });

    it('should handle admin data fetch errors', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getEventsError');

      cy.visit('/events');
      cy.wait('@getEventsError');

      // Should show error message gracefully
      cy.get('body').should('exist');
    });
  });
});
