// ***********************************************
// E2E Test Support File
// ***********************************************

// Import commands
import './commands';

// Global before hook
before(() => {
  cy.log('Starting E2E test suite');
});

// Global after hook
after(() => {
  cy.log('E2E test suite completed');
});

// Before each test
beforeEach(() => {
  // Clear cookies and localStorage
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set viewport
  cy.viewport(1280, 720);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on certain errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// Add custom logging
Cypress.on('fail', (error, runnable) => {
  cy.screenshot(`failure-${runnable.title}`);
  throw error;
});
