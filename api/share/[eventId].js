import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { eventId } = req.query;

  try {
    // Check for environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!process.env.VITE_SUPABASE_URL,
        hasKey: !!process.env.VITE_SUPABASE_ANON_KEY
      });
      return res.status(500).send('Server configuration error - missing environment variables');
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Fetch event from Supabase
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      console.error('Event not found:', { eventId, error });
      return res.status(404).send('Event not found');
    }

    // Build static HTML with Open Graph tags
    const eventUrl = `https://www.networkingbude.com/events/${eventId}`;
    const shareUrl = `https://www.networkingbude.com/api/share/${eventId}`;
    const imageUrl = event.image_url || event.image || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png';

    // Format date nicely
    let eventDate;
    try {
      eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      eventDate = event.date || 'Date TBD';
    }

    // Sanitize strings to prevent HTML breaking
    const sanitize = (str) => {
      if (!str) return '';
      return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    const safeTitle = sanitize(event.title);
    const safeDescription = sanitize(event.short_description || event.description);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${safeTitle} | Networking BudE</title>
  <meta name="title" content="${safeTitle}">
  <meta name="description" content="${safeDescription.substring(0, 200) || 'Join us for this networking event'}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription.substring(0, 200) || 'Join us for this networking event'}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:site_name" content="Networking BudE">
  <meta property="og:locale" content="en_US">

  <!-- Facebook Specific -->
  <meta property="fb:app_id" content="your_app_id" />
  <meta property="article:author" content="Networking BudE">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@NetworkingBudE">
  <meta name="twitter:creator" content="@NetworkingBudE">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription.substring(0, 200) || 'Join us for this networking event'}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${safeTitle}">

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

  <!-- JavaScript redirect for real users only -->
  <script>
    // Redirect real users immediately (social crawlers don't execute JavaScript)
    // Only redirect if the page is actually visible (not being crawled)
    if (document.visibilityState !== 'prerender') {
      setTimeout(function() {
        window.location.replace('${eventUrl}');
      }, 50);
    }
  </script>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${safeTitle}">
    <h1>${safeTitle}</h1>
    <p class="date">${eventDate}</p>
    <p>${safeDescription.substring(0, 200)}${safeDescription.length > 200 ? '...' : ''}</p>
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
    res.status(500).send(`Error generating share page: ${error.message}`);
  }
}
