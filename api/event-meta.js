/**
 * Event Meta Tags API
 * Serves proper Open Graph meta tags for social media sharing
 *
 * When crawlers visit /events/:id, redirect them here to get proper meta tags
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID required' });
  }

  try {
    // Fetch event details
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>${event.title} | Networking BudE</title>
    <meta name="title" content="${event.title} | Networking BudE" />
    <meta name="description" content="${event.short_description || `Join us for ${event.title} on ${event.date}`}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.networkingbude.com/events/${eventId}" />
    <meta property="og:title" content="${event.title}" />
    <meta property="og:description" content="${event.short_description || `Join us for ${event.title} on ${event.date}`}" />
    <meta property="og:image" content="${event.image_url || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Networking BudE" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://www.networkingbude.com/events/${eventId}" />
    <meta name="twitter:title" content="${event.title}" />
    <meta name="twitter:description" content="${event.short_description || `Join us for ${event.title} on ${event.date}`}" />
    <meta name="twitter:image" content="${event.image_url || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png'}" />

    <!-- Redirect to actual event page after meta tags are read -->
    <meta http-equiv="refresh" content="0;url=/events/${eventId}" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  </head>
  <body>
    <p>Redirecting to event...</p>
    <script>
      window.location.href = '/events/${eventId}';
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error generating event meta tags:', error);
    res.status(500).json({ error: 'Failed to generate meta tags' });
  }
}
