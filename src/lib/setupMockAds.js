/**
 * Setup Mock Ads for BudE Networking App
 * Run this script to populate localStorage with mock advertisement data
 *
 * Usage: Import and call setupMockAds() when the app loads
 */

export function setupMockAds() {
  // Mock Ad 1: Tech Innovation Summit (Sidebar - Vertical 160x600)
  const techEventAd = {
    image: createTechEventSVG(),
    url: 'https://example.com/tech-innovation-summit',
    tags: 'technology,innovation,startup,ai'
  };

  // Mock Ad 2: Annual Charity Gala (Sidebar - Vertical 160x600)
  const galaAd = {
    image: createGalaEventSVG(),
    url: 'https://example.com/annual-charity-gala',
    tags: 'gala,fundraiser,charity,networking'
  };

  // Mock Ad 3: Chamber Membership Drive (Bottom Banner - Horizontal 728x160)
  const membershipAd = {
    image: createMembershipDriveSVG(),
    url: 'https://example.com/chamber-membership',
    tags: 'membership,chamber,business,networking'
  };

  // Save to localStorage
  localStorage.setItem('ad_eventsSidebar1', JSON.stringify(techEventAd));
  localStorage.setItem('ad_eventsSidebar2', JSON.stringify(galaAd));
  localStorage.setItem('ad_eventsBottom', JSON.stringify(membershipAd));
  localStorage.setItem('ad_eventDetailBanner', JSON.stringify(membershipAd));

  console.log('✅ Mock ads loaded successfully!');
  console.log('  - Tech Innovation Summit (Sidebar 1)');
  console.log('  - Annual Charity Gala (Sidebar 2)');
  console.log('  - Chamber Membership Drive (Bottom Banner)');
}

// SVG Generator Functions

function createTechEventSVG() {
  const svg = `
    <svg width="160" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Gradient -->
      <defs>
        <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="160" height="600" fill="url(#techGrad)"/>

      <!-- Icon -->
      <circle cx="80" cy="120" r="35" fill="#60a5fa" opacity="0.3"/>
      <path d="M 80 95 L 95 110 L 80 125 L 65 110 Z" fill="white"/>
      <circle cx="80" cy="110" r="8" fill="white"/>

      <!-- Text Content -->
      <text x="80" y="200" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        <tspan x="80" dy="0">TECH</tspan>
        <tspan x="80" dy="22">INNOVATION</tspan>
        <tspan x="80" dy="22">SUMMIT</tspan>
        <tspan x="80" dy="22">2025</tspan>
      </text>

      <!-- Date -->
      <rect x="20" y="320" width="120" height="50" fill="white" opacity="0.15" rx="8"/>
      <text x="80" y="338" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">March 15-16</text>
      <text x="80" y="358" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">Grand Rapids, MI</text>

      <!-- Details -->
      <text x="80" y="420" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle">
        <tspan x="80" dy="0">AI • Startups</tspan>
        <tspan x="80" dy="16">Innovation</tspan>
      </text>

      <!-- CTA Button -->
      <rect x="25" y="480" width="110" height="35" fill="#d0ed00" rx="18"/>
      <text x="80" y="503" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Learn More</text>

      <!-- Sample Ad Label -->
      <text x="80" y="570" font-family="Arial, sans-serif" font-size="9" fill="white" opacity="0.5" text-anchor="middle">SAMPLE AD</text>

      <!-- Border -->
      <rect width="160" height="600" fill="none" stroke="#60a5fa" stroke-width="2"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function createGalaEventSVG() {
  const svg = `
    <svg width="160" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Gradient -->
      <defs>
        <linearGradient id="galaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4c1d95;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="shine" cx="50%" cy="30%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="160" height="600" fill="url(#galaGrad)"/>
      <ellipse cx="80" cy="150" rx="60" ry="40" fill="url(#shine)"/>

      <!-- Decorative Elements -->
      <path d="M 80 80 L 85 95 L 100 95 L 88 105 L 93 120 L 80 110 L 67 120 L 72 105 L 60 95 L 75 95 Z" fill="#fbbf24"/>
      <circle cx="40" cy="180" r="3" fill="#fbbf24" opacity="0.6"/>
      <circle cx="120" cy="190" r="3" fill="#fbbf24" opacity="0.6"/>
      <circle cx="50" cy="220" r="2" fill="#fbbf24" opacity="0.4"/>
      <circle cx="110" cy="210" r="2" fill="#fbbf24" opacity="0.4"/>

      <!-- Text Content -->
      <text x="80" y="250" font-family="Georgia, serif" font-size="16" font-weight="bold" font-style="italic" fill="#fbbf24" text-anchor="middle">
        <tspan x="80" dy="0">Annual</tspan>
      </text>
      <text x="80" y="280" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
        <tspan x="80" dy="0">CHARITY</tspan>
        <tspan x="80" dy="24">GALA</tspan>
      </text>

      <!-- Date Box -->
      <rect x="30" y="340" width="100" height="60" fill="white" opacity="0.15" rx="8"/>
      <text x="80" y="362" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">April 12, 2025</text>
      <text x="80" y="381" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle">7:00 PM</text>
      <text x="80" y="396" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle">Black Tie Optional</text>

      <!-- Details -->
      <text x="80" y="440" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle">
        <tspan x="80" dy="0">An Evening of</tspan>
        <tspan x="80" dy="16">Elegance &amp; Impact</tspan>
      </text>

      <!-- CTA Button -->
      <rect x="25" y="480" width="110" height="35" fill="#fbbf24" rx="18"/>
      <text x="80" y="503" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#4c1d95" text-anchor="middle">Get Tickets</text>

      <!-- Sample Ad Label -->
      <text x="80" y="570" font-family="Arial, sans-serif" font-size="9" fill="white" opacity="0.5" text-anchor="middle">SAMPLE AD</text>

      <!-- Border -->
      <rect width="160" height="600" fill="none" stroke="#a78bfa" stroke-width="2"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

function createMembershipDriveSVG() {
  const svg = `
    <svg width="728" height="160" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <defs>
        <linearGradient id="memberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#065f46;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="728" height="160" fill="url(#memberGrad)"/>

      <!-- Decorative Circles -->
      <circle cx="650" cy="80" r="60" fill="#10b981" opacity="0.2"/>
      <circle cx="680" cy="50" r="40" fill="#10b981" opacity="0.15"/>

      <!-- Icon/Logo Area -->
      <circle cx="100" cy="80" r="45" fill="#d0ed00" opacity="0.2"/>
      <path d="M 100 60 L 110 70 L 100 80 L 90 70 Z M 100 85 L 110 95 L 100 105 L 90 95 Z" fill="#d0ed00"/>
      <circle cx="85" cy="70" r="8" fill="white"/>
      <circle cx="115" cy="70" r="8" fill="white"/>
      <circle cx="100" cy="95" r="8" fill="white"/>

      <!-- Main Text Content -->
      <text x="180" y="50" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">
        Join the Chamber Today
      </text>
      <text x="180" y="80" font-family="Arial, sans-serif" font-size="16" fill="#d0ed00">
        Connect • Grow • Thrive
      </text>
      <text x="180" y="108" font-family="Arial, sans-serif" font-size="14" fill="white">
        <tspan x="180" dy="0">Unlock exclusive networking opportunities and business resources</tspan>
      </text>
      <text x="180" y="130" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#d0ed00">
        Special Rate: $299/year • Limited Time Offer
      </text>

      <!-- CTA Button -->
      <rect x="590" y="55" width="120" height="50" fill="#d0ed00" rx="25"/>
      <text x="650" y="85" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#065f46" text-anchor="middle">
        <tspan x="650" dy="0">Join Now</tspan>
      </text>

      <!-- Sample Ad Label -->
      <text x="690" y="150" font-family="Arial, sans-serif" font-size="9" fill="white" opacity="0.5" text-anchor="end">SAMPLE AD</text>

      <!-- Border -->
      <rect width="728" height="160" fill="none" stroke="#10b981" stroke-width="3"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Remove mock ads (useful for testing)
export function clearMockAds() {
  localStorage.removeItem('ad_eventsSidebar1');
  localStorage.removeItem('ad_eventsSidebar2');
  localStorage.removeItem('ad_eventsBottom');
  localStorage.removeItem('ad_eventDetailBanner');
  console.log('🗑️ Mock ads cleared');
}
