/**
 * Setup Mock Ads for BudE Networking App
 * Run this script to populate localStorage with mock advertisement data
 *
 * Usage: Import and call setupMockAds() when the app loads
 */

export function setupMockAds() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('setupMockAds called in non-browser environment');
    return;
  }

  // Mock Ad 1: AI & Innovation Conference (Sidebar - Vertical 160x600)
  const aiConferenceAd = {
    image: createAIConferenceSVG(),
    url: '', // Empty URL triggers ad inquiry modal
    tags: 'technology,innovation,ai,conference'
  };

  // Mock Ad 2: Charity Run Event (Sidebar - Vertical 160x600)
  const charityRunAd = {
    image: createCharityRunSVG(),
    url: '', // Empty URL triggers ad inquiry modal
    tags: 'charity,fundraiser,health,community'
  };

  // Mock Ad 3: Business Expo (Bottom Banner - Horizontal 728x160)
  const businessExpoAd = {
    image: createBusinessExpoSVG(),
    url: '', // Empty URL triggers ad inquiry modal
    tags: 'business,expo,networking,trade'
  };

  // Save to localStorage
  localStorage.setItem('ad_eventsSidebar1', JSON.stringify(aiConferenceAd));
  localStorage.setItem('ad_eventsSidebar2', JSON.stringify(charityRunAd));
  localStorage.setItem('ad_eventsBottom', JSON.stringify(businessExpoAd));
  localStorage.setItem('ad_eventDetailBanner', JSON.stringify(businessExpoAd));

  console.log('✅ Mock ads loaded successfully!');
  console.log('  - AI & Innovation Conference (Sidebar 1)');
  console.log('  - Charity Run Event (Sidebar 2)');
  console.log('  - Business Expo (Bottom Banner)');
}

// SVG Generator Functions

function createAIConferenceSVG() {
  const svg = `
    <svg width="160" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- Modern gradient background -->
      <defs>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="160" height="600" fill="url(#aiGrad)"/>

      <!-- Abstract AI Brain Illustration -->
      <circle cx="80" cy="110" r="40" fill="#3b82f6" opacity="0.1"/>
      <circle cx="80" cy="110" r="30" fill="#3b82f6" opacity="0.2"/>

      <!-- Neural network nodes -->
      <circle cx="60" cy="90" r="4" fill="#60a5fa"/>
      <circle cx="100" cy="90" r="4" fill="#60a5fa"/>
      <circle cx="70" cy="110" r="4" fill="#60a5fa"/>
      <circle cx="90" cy="110" r="4" fill="#60a5fa"/>
      <circle cx="60" cy="130" r="4" fill="#60a5fa"/>
      <circle cx="100" cy="130" r="4" fill="#60a5fa"/>
      <circle cx="80" cy="145" r="4" fill="#60a5fa"/>

      <!-- Neural network connections -->
      <line x1="60" y1="90" x2="70" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="60" y1="90" x2="90" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="100" y1="90" x2="70" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="100" y1="90" x2="90" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="70" y1="110" x2="60" y2="130" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="90" y1="110" x2="100" y2="130" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="60" y1="130" x2="80" y2="145" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="100" y1="130" x2="80" y2="145" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>

      <!-- Title -->
      <text x="80" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="white" text-anchor="middle">
        AI &amp;
      </text>
      <text x="80" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="white" text-anchor="middle">
        Innovation
      </text>
      <text x="80" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#94a3b8" text-anchor="middle">
        Conference 2025
      </text>

      <!-- Date Badge -->
      <rect x="30" y="290" width="100" height="55" fill="#3b82f6" rx="12"/>
      <text x="80" y="312" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="white" text-anchor="middle">March 15-16</text>
      <text x="80" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.9)" text-anchor="middle">Grand Rapids</text>

      <!-- Features -->
      <text x="80" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">
        <tspan x="80" dy="0">Expert Speakers</tspan>
        <tspan x="80" dy="18">Workshops</tspan>
        <tspan x="80" dy="18">Networking</tspan>
      </text>

      <!-- CTA -->
      <rect x="30" y="480" width="100" height="40" fill="#d0ed00" rx="20"/>
      <text x="80" y="505" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">Register Now</text>

      <!-- Sample Label -->
      <text x="80" y="565" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="white" opacity="0.4" text-anchor="middle">SAMPLE AD</text>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function createCharityRunSVG() {
  const svg = `
    <svg width="160" height="600" xmlns="http://www.w3.org/2000/svg">
      <!-- Fresh gradient background -->
      <defs>
        <linearGradient id="runGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#047857;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="160" height="600" fill="url(#runGrad)"/>

      <!-- Running person illustration -->
      <!-- Head -->
      <circle cx="75" cy="80" r="12" fill="#d0ed00"/>
      <!-- Body -->
      <path d="M 75 92 L 75 130" stroke="#d0ed00" stroke-width="5" stroke-linecap="round"/>
      <!-- Running arms -->
      <path d="M 75 100 L 60 115" stroke="#d0ed00" stroke-width="4" stroke-linecap="round"/>
      <path d="M 75 105 L 90 90" stroke="#d0ed00" stroke-width="4" stroke-linecap="round"/>
      <!-- Running legs -->
      <path d="M 75 130 L 85 150" stroke="#d0ed00" stroke-width="5" stroke-linecap="round"/>
      <path d="M 75 130 L 60 145" stroke="#d0ed00" stroke-width="5" stroke-linecap="round"/>

      <!-- Motion lines -->
      <line x1="95" y1="90" x2="110" y2="85" stroke="#d0ed00" stroke-width="2" opacity="0.4"/>
      <line x1="95" y1="100" x2="115" y2="95" stroke="#d0ed00" stroke-width="2" opacity="0.4"/>
      <line x1="95" y1="110" x2="112" y2="105" stroke="#d0ed00" stroke-width="2" opacity="0.4"/>

      <!-- Heart icon -->
      <path d="M 80 175 C 80 170 85 167 88 170 C 91 167 96 170 96 175 C 96 180 88 187 88 187 C 88 187 80 180 80 175 Z" fill="#fca5a5"/>

      <!-- Title -->
      <text x="80" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" fill="white" text-anchor="middle">
        Community
      </text>
      <text x="80" y="242" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" fill="white" text-anchor="middle">
        5K Run
      </text>
      <text x="80" y="265" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#d0ed00" text-anchor="middle">
        for Charity
      </text>

      <!-- Date Badge -->
      <rect x="25" y="295" width="110" height="55" fill="rgba(255,255,255,0.15)" rx="12"/>
      <text x="80" y="317" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="white" text-anchor="middle">Saturday, April 19</text>
      <text x="80" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.9)" text-anchor="middle">8:00 AM Start</text>

      <!-- Features -->
      <text x="80" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.85)" text-anchor="middle">
        <tspan x="80" dy="0">All Ages Welcome</tspan>
        <tspan x="80" dy="18">Free T-Shirt</tspan>
        <tspan x="80" dy="18">Post-Race Food</tspan>
      </text>

      <!-- CTA -->
      <rect x="30" y="480" width="100" height="40" fill="#d0ed00" rx="20"/>
      <text x="80" y="505" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#047857" text-anchor="middle">Sign Up</text>

      <!-- Sample Label -->
      <text x="80" y="565" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="white" opacity="0.4" text-anchor="middle">SAMPLE AD</text>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function createBusinessExpoSVG() {
  const svg = `
    <svg width="728" height="160" xmlns="http://www.w3.org/2000/svg">
      <!-- Modern background -->
      <defs>
        <linearGradient id="expoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="728" height="160" fill="url(#expoGrad)"/>

      <!-- Abstract networking illustration - connected nodes -->
      <circle cx="100" cy="60" r="8" fill="#d0ed00"/>
      <circle cx="140" cy="60" r="8" fill="#d0ed00"/>
      <circle cx="120" cy="100" r="8" fill="#d0ed00"/>
      <circle cx="80" cy="100" r="8" fill="#d0ed00"/>
      <circle cx="160" cy="100" r="8" fill="#d0ed00"/>

      <!-- Connection lines -->
      <line x1="100" y1="60" x2="140" y2="60" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="100" y1="60" x2="120" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="100" y1="60" x2="80" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="140" y1="60" x2="120" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="140" y1="60" x2="160" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="120" y1="100" x2="80" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>
      <line x1="120" y1="100" x2="160" y2="100" stroke="#d0ed00" stroke-width="2" opacity="0.5"/>

      <!-- Decorative circles -->
      <circle cx="650" cy="80" r="70" fill="#60a5fa" opacity="0.1"/>
      <circle cx="680" cy="50" r="45" fill="#60a5fa" opacity="0.1"/>

      <!-- Main content -->
      <text x="200" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="white">
        West Michigan Business Expo
      </text>
      <text x="200" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#d0ed00">
        Connect with 200+ Local Businesses
      </text>
      <text x="200" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="rgba(255,255,255,0.9)">
        May 8-9, 2025  |  DeVos Place  |  Free Admission
      </text>
      <text x="200" y="135" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">
        Workshops  •  Networking  •  Live Demos
      </text>

      <!-- CTA Button -->
      <rect x="585" y="55" width="130" height="50" fill="#d0ed00" rx="25"/>
      <text x="650" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#1e40af" text-anchor="middle">
        Learn More
      </text>

      <!-- Sample Label -->
      <text x="710" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="white" opacity="0.4" text-anchor="end">SAMPLE AD</text>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Remove mock ads (useful for testing)
export function clearMockAds() {
  localStorage.removeItem('ad_eventsSidebar1');
  localStorage.removeItem('ad_eventsSidebar2');
  localStorage.removeItem('ad_eventsBottom');
  localStorage.removeItem('ad_eventDetailBanner');
  console.log('🗑️ Mock ads cleared');
}
