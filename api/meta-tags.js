import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  const { url } = req.query;

  // Log for debugging
  console.log('Meta-tags request:', {
    url,
    userAgent: req.headers['user-agent'],
    fullUrl: req.url
  });

  // Read the base HTML file - try multiple locations for Vercel
  let html;
  try {
    // Try Vercel build output first
    const vercelPath = path.join(process.cwd(), '.vercel', 'output', 'static', 'index.html');
    html = fs.readFileSync(vercelPath, 'utf8');
  } catch (e) {
    try {
      // Fall back to dist folder
      const distPath = path.join(process.cwd(), 'dist', 'index.html');
      html = fs.readFileSync(distPath, 'utf8');
    } catch (e2) {
      // Last resort - use a minimal template
      html = `<!DOCTYPE html><html><head></head><body></body></html>`;
      console.error('Could not find index.html:', e2);
    }
  }

  try {
    // Check if URL is for an event (matches UUIDs and numeric IDs)
    const eventMatch = url?.match(/^\/events\/([a-zA-Z0-9-]+)$/);
    const contentMatch = url?.match(/^\/resources-insights(?:\/(\d+))?$/);

    if (eventMatch && supabaseUrl && supabaseKey) {
      const eventId = eventMatch[1];
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      // Log for debugging
      console.log('Event query result:', { eventId, found: !!event, error: error?.message });

      const title = event?.title || 'Networking Event | Networking BudE';
      const description = event ? (event.short_description || event.full_description || 'Join us for this networking event in West Michigan')
        .replace(/"/g, '&quot;')
        .substring(0, 200) : 'Join us for this networking event in West Michigan';

      // Get image and optimize for LinkedIn (1200px width minimum)
      let image = event?.image_url || event?.image || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png';

      // Handle double-encoded Eventbrite URLs (e.g., https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com/...)
      if (image.includes('img.evbuc.com/https%3A')) {
        // Extract the inner URL and decode it
        const match = image.match(/img\.evbuc\.com\/(https%3A[^?]+)/);
        if (match) {
          image = decodeURIComponent(match[1]);
        }
      }

      // If it's an Eventbrite image with width parameter, increase to 1200 for better LinkedIn preview
      if (image.includes('evbuc.com') && image.includes('w=')) {
        image = image.replace(/w=\d+/, 'w=1200');
      }

      const fullUrl = `https://www.networkingbude.com${url}`;

      const ogTags = `
    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:site_name" content="Networking BudE" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
      `;

      html = html.replace('</head>', `${ogTags}\n  </head>`);
    } else if (contentMatch && supabaseUrl && supabaseKey) {
      const contentId = contentMatch[1];

      if (contentId) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: content, error } = await supabase
          .from('featured_content')
          .select('*')
          .eq('slot_number', contentId)
          .single();

        if (content && !error) {
          const title = content.title || 'Featured Content';
          const description = (content.description || 'Discover curated networking content and insights')
            .replace(/"/g, '&quot;')
            .substring(0, 200);
          const image = content.image || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png';
          const fullUrl = `https://www.networkingbude.com${url}`;

          const ogTags = `
    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${title} | Networking BudE" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:site_name" content="Networking BudE" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${title} | Networking BudE" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
          `;

          html = html.replace('</head>', `${ogTags}\n  </head>`);
        }
      } else {
        // Default resources page
        const fullUrl = `https://www.networkingbude.com${url}`;
        const ogTags = `
    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="Resources & Insights | Networking BudE" />
    <meta property="og:description" content="Discover curated networking content, podcasts, and insights to help you grow professionally in West Michigan." />
    <meta property="og:image" content="https://www.networkingbude.com/BudE-Color-Logo-Rev.png" />
    <meta property="og:image:secure_url" content="https://www.networkingbude.com/BudE-Color-Logo-Rev.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:site_name" content="Networking BudE" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="Resources & Insights | Networking BudE" />
    <meta name="twitter:description" content="Discover curated networking content, podcasts, and insights to help you grow professionally in West Michigan." />
    <meta name="twitter:image" content="https://www.networkingbude.com/BudE-Color-Logo-Rev.png" />
        `;

        html = html.replace('</head>', `${ogTags}\n  </head>`);
      }
    }
  } catch (error) {
    console.error('Error generating meta tags:', error);
  }

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
