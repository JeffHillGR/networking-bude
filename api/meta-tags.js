import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  const { url } = req.query;

  // Read the base HTML file
  const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

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
      let image = event?.image || event?.image_url || 'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png';
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
          const image = content.image || 'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png';
          const fullUrl = `https://www.networkingbude.com${url}`;

          const ogTags = `
    <!-- Open Graph / Facebook / LinkedIn -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${title} | Networking BudE" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
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
    <meta property="og:image" content="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png" />
    <meta property="og:image:secure_url" content="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png" />
    <meta property="og:site_name" content="Networking BudE" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="Resources & Insights | Networking BudE" />
    <meta name="twitter:description" content="Discover curated networking content, podcasts, and insights to help you grow professionally in West Michigan." />
    <meta name="twitter:image" content="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png" />
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
