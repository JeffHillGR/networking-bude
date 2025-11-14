import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { eventId } = req.query;

  try {
    // Fetch event from Supabase
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return res.status(404).send('Event not found');
    }

    // Build static HTML with Open Graph tags
    const eventUrl = `https://www.networkingbude.com/events/${eventId}`;
    const shareUrl = `https://www.networkingbude.com/api/share/${eventId}`;
    const imageUrl = event.image_url || event.image || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png';

    // Format date nicely
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${event.title} | Networking BudE</title>
  <meta name="title" content="${event.title}">
  <meta name="description" content="${event.description?.substring(0, 200) || 'Join us for this networking event'}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${event.title}">
  <meta property="og:description" content="${event.description?.substring(0, 200) || 'Join us for this networking event'}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Networking BudE">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${shareUrl}">
  <meta property="twitter:title" content="${event.title}">
  <meta property="twitter:description" content="${event.description?.substring(0, 200) || 'Join us for this networking event'}">
  <meta property="twitter:image" content="${imageUrl}">

  <!-- LinkedIn Specific -->
  <meta property="og:image:secure_url" content="${imageUrl}">

  <!-- Auto-redirect for real users (not bots) -->
  <meta http-equiv="refresh" content="0;url=${eventUrl}">

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    h1 {
      color: #009900;
      margin-bottom: 10px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .date {
      color: #009900;
      font-weight: 600;
      margin-bottom: 20px;
    }
    a {
      display: inline-block;
      background: #009900;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
    }
    a:hover {
      background: #007700;
    }
    .redirect-message {
      color: #999;
      font-size: 14px;
      margin-top: 20px;
    }
  </style>

  <!-- JavaScript redirect as backup -->
  <script>
    // Only redirect if not a bot
    if (!/bot|crawler|spider|crawling/i.test(navigator.userAgent)) {
      window.location.replace('${eventUrl}');
    }
  </script>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${event.title}">
    <h1>${event.title}</h1>
    <p class="date">${eventDate}</p>
    <p>${event.description?.substring(0, 200) || 'Join us for this networking event'}${event.description?.length > 200 ? '...' : ''}</p>
    <a href="${eventUrl}">View Full Event Details</a>
    <p class="redirect-message">Redirecting you to the event page...</p>
  </div>
</body>
</html>`;

    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error generating share page:', error);
    res.status(500).send('Error generating share page');
  }
}
