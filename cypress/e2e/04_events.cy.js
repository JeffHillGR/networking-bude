/**
 * Events Flow Tests
 * Tests event browsing, search, filtering, and engagement
 */

describe('Events Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'TestPass123!');
    cy.visit('/events');
  });

  describe('Events Page', () => {
    it('should display events page', () => {
      cy.url().should('include', '/events');
      cy.contains(/events|upcoming/i).should('be.visible');
    });

    it('should load and display events', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('getEvents');

      cy.wait('@getEvents');

      cy.get('[data-testid="event-card"]').should('have.length.greaterThan', 0);
    });

    it('should display event cards with key information', () => {
      cy.get('[data-testid="event-card"]').first().within(() => {
        cy.get('h2, h3').should('exist'); // Title
        cy.contains(/\d{1,2}\/\d{1,2}|date/i).should('exist'); // Date
        cy.contains(/location|virtual|online/i).should('exist'); // Location
      });
    });
  });

  describe('Event Search', () => {
    it('should have search functionality', () => {
      cy.get('input[type="search"], input[placeholder*="search" i]').should('be.visible');
    });

    it('should filter events by search query', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('getEvents');

      cy.get('input[type="search"]').type('networking');

      cy.wait('@getEvents');

      // Results should contain search term
      cy.get('[data-testid="event-card"]').first().should('contain.text', /networking/i);
    });

    it('should show no results message when search has no matches', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 200,
        body: []
      }).as('noResults');

      cy.get('input[type="search"]').type('xyzabc123nonexistent');

      cy.wait('@noResults');

      cy.contains(/no.*events.*found|no.*results/i).should('be.visible');
    });

    it('should clear search', () => {
      cy.get('input[type="search"]').type('networking');

      cy.get('button[aria-label*="clear" i], button').contains(/clear|×/i).click();

      cy.get('input[type="search"]').should('have.value', '');
    });
  });

  describe('Event Filtering', () => {
    it('should filter by event type', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('filterEvents');

      // Select event type filter
      cy.get('select[name="eventType"], button').contains(/type|category/i).click();
      cy.contains(/networking|workshop|conference/i).click();

      cy.wait('@filterEvents');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should filter by organization', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('filterEvents');

      cy.get('select[name="organization"]').select(1); // Select first organization

      cy.wait('@filterEvents');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should filter by date range', () => {
      cy.get('input[type="date"]').first().type('2025-01-01');
      cy.get('input[type="date"]').last().type('2025-12-31');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should show virtual events only', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('virtualEvents');

      cy.get('input[type="checkbox"]').contains(/virtual|online/i).check();

      cy.wait('@virtualEvents');

      cy.get('[data-testid="event-card"]').each(($card) => {
        cy.wrap($card).should('contain.text', /virtual|online/i);
      });
    });

    it('should combine multiple filters', () => {
      cy.intercept('GET', '**/rest/v1/events*').as('multiFilter');

      // Type + Organization + Virtual
      cy.get('select[name="eventType"]').select('Networking');
      cy.get('select[name="organization"]').select(1);
      cy.get('input[type="checkbox"]').contains(/virtual/i).check();

      cy.wait('@multiFilter');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('select[name="eventType"]').select(1);
      cy.get('input[type="checkbox"]').first().check();

      // Clear filters
      cy.get('button').contains(/clear.*filters|reset/i).click();

      // Filters should be reset
      cy.get('select[name="eventType"]').should('have.value', '');
      cy.get('input[type="checkbox"]:checked').should('not.exist');
    });
  });

  describe('Event Details', () => {
    it('should open event details', () => {
      cy.get('[data-testid="event-card"]').first().click();

      // Should show modal or navigate to detail page
      cy.get('[data-testid="event-details"]').should('be.visible');
    });

    it('should display full event information', () => {
      cy.get('[data-testid="event-card"]').first().click();

      cy.get('[data-testid="event-details"]').within(() => {
        cy.contains(/title|name/i).should('exist');
        cy.contains(/date|when/i).should('exist');
        cy.contains(/location|where/i).should('exist');
        cy.contains(/description|about/i).should('exist');
      });
    });

    it('should have registration/RSVP button', () => {
      cy.get('[data-testid="event-card"]').first().click();

      cy.get('button, a').contains(/register|rsvp|sign up|attend/i).should('be.visible');
    });

    it('should track registration clicks', () => {
      cy.intercept('POST', '**/rest/v1/event_registration_clicks*').as('trackClick');

      cy.get('[data-testid="event-card"]').first().click();
      cy.get('button').contains(/register|rsvp/i).click();

      cy.wait('@trackClick');
    });

    it('should close event details', () => {
      cy.get('[data-testid="event-card"]').first().click();

      cy.get('[data-testid="event-details"]').should('be.visible');

      cy.get('button[aria-label*="close" i], button').contains(/close|×/i).click();

      cy.get('[data-testid="event-details"]').should('not.exist');
    });
  });

  describe('Event Engagement', () => {
    it('should allow liking events', () => {
      cy.intercept('POST', '**/rest/v1/event_likes*').as('likeEvent');

      cy.get('[data-testid="like-button"]').first().click();

      cy.wait('@likeEvent');

      // Button should show liked state
      cy.get('[data-testid="like-button"]').first().should('have.class', /liked|active/);
    });

    it('should allow unliking events', () => {
      cy.intercept('DELETE', '**/rest/v1/event_likes*').as('unlikeEvent');

      // Like first
      cy.get('[data-testid="like-button"]').first().click();

      // Unlike
      cy.get('[data-testid="like-button"]').first().click();

      cy.wait('@unlikeEvent');

      // Button should show unliked state
      cy.get('[data-testid="like-button"]').first().should('not.have.class', /liked|active/);
    });

    it('should display like count', () => {
      cy.get('[data-testid="like-count"]').first().should('be.visible');
      cy.get('[data-testid="like-count"]').first().should('contain.text', /\d+/);
    });

    it('should update like count after liking', () => {
      cy.get('[data-testid="like-count"]').first().invoke('text').then((initialCount) => {
        const count = parseInt(initialCount);

        cy.get('[data-testid="like-button"]').first().click();

        cy.get('[data-testid="like-count"]').first().should('contain.text', count + 1);
      });
    });

    it('should display registration click count', () => {
      cy.get('[data-testid="event-card"]').first().within(() => {
        cy.contains(/\d+.*registered|attendees/i).should('be.visible');
      });
    });
  });

  describe('Event Sharing', () => {
    it('should have share button', () => {
      cy.get('[data-testid="share-button"]').first().should('be.visible');
    });

    it('should open share modal', () => {
      cy.get('[data-testid="share-button"]').first().click();

      cy.get('[data-testid="share-modal"]').should('be.visible');
    });

    it('should copy event link to clipboard', () => {
      cy.get('[data-testid="share-button"]').first().click();

      cy.get('button').contains(/copy.*link|copy.*url/i).click();

      // Should show success message
      cy.contains(/copied|link.*copied/i).should('be.visible');
    });
  });

  describe('Event Submission', () => {
    it('should have "Suggest Event" button', () => {
      cy.contains(/suggest.*event|add.*event|submit.*event/i).should('be.visible');
    });

    it('should open event submission form', () => {
      cy.contains(/suggest.*event/i).click();

      cy.get('[data-testid="event-form"]').should('be.visible');
    });

    it('should validate event submission form', () => {
      cy.contains(/suggest.*event/i).click();

      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click();

      cy.contains(/required/i).should('be.visible');
    });

    it('should submit event suggestion', () => {
      cy.intercept('POST', '**/api/submitEvent*').as('submitEvent');

      cy.contains(/suggest.*event/i).click();

      // Fill form
      cy.get('input[name="eventTitle"]').type('Test Networking Event');
      cy.get('input[name="eventDate"]').type('2025-12-31');
      cy.get('input[name="eventLocation"]').type('Grand Rapids, MI');
      cy.get('textarea[name="eventDescription"]').type('A great networking opportunity');
      cy.get('input[name="eventUrl"]').type('https://example.com/event');

      cy.get('button[type="submit"]').click();

      cy.wait('@submitEvent');

      // Should show success message
      cy.contains(/submitted|thank you|received/i).should('be.visible');
    });
  });

  describe('Event Sorting', () => {
    it('should sort by date', () => {
      cy.get('select[name="sortBy"]').select('Date');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should sort by popularity (likes)', () => {
      cy.get('select[name="sortBy"]').select('Popularity');

      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should sort by recently added', () => {
      cy.get('select[name="sortBy"]').select('Recently Added');

      cy.get('[data-testid="event-card"]').should('exist');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      cy.contains(/page|showing|of.*\d+/i).should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.get('button').contains(/next|>>/i).click();

      cy.url().should('include', 'page=2');
      cy.get('[data-testid="event-card"]').should('exist');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.visit('/events?page=2');

      cy.get('button').contains(/previous|<</i).click();

      cy.url().should('include', 'page=1');
    });

    it('should jump to specific page', () => {
      cy.get('input[type="number"]').type('3{enter}');

      cy.url().should('include', 'page=3');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="event-card"]').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="event-card"]').should('be.visible');
    });

    it('should adjust layout for mobile', () => {
      cy.viewport(375, 667);

      // Cards should stack vertically
      cy.get('[data-testid="event-card"]').first().should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle failed event loading', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('serverError');

      cy.visit('/events');
      cy.wait('@serverError');

      cy.contains(/error|failed.*load|try.*again/i).should('be.visible');
    });

    it('should retry loading events', () => {
      cy.intercept('GET', '**/rest/v1/events*', {
        statusCode: 500
      }).as('error');

      cy.visit('/events');
      cy.wait('@error');

      cy.get('button').contains(/retry|try.*again/i).click();

      cy.wait('@error');
    });
  });
});
