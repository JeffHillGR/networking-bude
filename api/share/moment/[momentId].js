import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { momentId } = req.query;

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

    // Fetch event moment from Supabase with photos
    const { data: moment, error } = await supabase
      .from('event_moments')
      .select(`
        *,
        event_moment_photos (
          id,
          image_url,
          display_order
        )
      `)
      .eq('id', momentId)
      .single();

    if (error || !moment) {
      console.error('Event moment not found:', { momentId, error });
      // Redirect to event moments page with a friendly message
      const momentsUrl = 'https://www.networkingbude.com/event-moments';
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Moment Not Found | Networking BudE</title>
  <meta property="og:title" content="Check out Event Moments on Networking BudE">
  <meta property="og:description" content="Browse photos from networking events in your community!">
  <meta property="og:image" content="https://www.networkingbude.com/BudE-Color-Logo-Rev.png">
  <meta property="og:url" content="${momentsUrl}">
  <script>window.location.replace('${momentsUrl}');</script>
  <style>
    body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; }
    a { color: #009900; }
  </style>
</head>
<body>
  <h1>This event moment is no longer available</h1>
  <p>Redirecting you to Event Moments...</p>
  <p><a href="${momentsUrl}">Click here if not redirected</a></p>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // Build static HTML with Open Graph tags
    const momentUrl = `https://www.networkingbude.com/event-moments`;
    const shareUrl = `https://www.networkingbude.com/api/share/moment/${momentId}`;

    // Get the first photo for the image, or use fallback
    const photos = moment.event_moment_photos || [];
    const sortedPhotos = photos.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const imageUrl = sortedPhotos[0]?.image_url || 'https://www.networkingbude.com/BudE-Color-Logo-Rev.png';

    // Sanitize strings to prevent HTML breaking
    const sanitize = (str) => {
      if (!str) return '';
      return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    const safeEventName = sanitize(moment.event_name);
    const safeDescription = sanitize(moment.description || `Photos from ${moment.event_name}`);
    const photoCount = photos.length;
    const photoText = photoCount > 1 ? `${photoCount} photos` : photoCount === 1 ? '1 photo' : '';

    // Build a nice description for sharing
    let ogDescription = safeDescription;
    if (moment.organization_name) {
      ogDescription = `Hosted by ${sanitize(moment.organization_name)}. ${safeDescription}`;
    }
    if (photoText) {
      ogDescription = `${photoText} from this event. ${ogDescription}`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${safeEventName} | Event Moments | Networking BudE</title>
  <meta name="title" content="${safeEventName} - Event Moments">
  <meta name="description" content="${ogDescription.substring(0, 200)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${safeEventName}">
  <meta property="og:description" content="${ogDescription.substring(0, 200)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeEventName}">
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
  <meta name="twitter:title" content="${safeEventName}">
  <meta name="twitter:description" content="${ogDescription.substring(0, 200)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${safeEventName}">

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
    .event-date {
      color: #666;
      font-style: italic;
      margin-bottom: 10px;
    }
    .organization {
      color: #666;
      margin-bottom: 15px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .photo-count {
      display: inline-block;
      background: #009900;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
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
        window.location.replace('${momentUrl}');
      }, 50);
    }
  </script>
</head>
<body>
  <div class="container">
    <img src="${imageUrl}" alt="${safeEventName}">
    <h1>${safeEventName}</h1>
    ${moment.event_date ? `<p class="event-date">${sanitize(moment.event_date)}</p>` : ''}
    ${moment.organization_name ? `<p class="organization">Hosted by ${sanitize(moment.organization_name)}</p>` : ''}
    ${photoText ? `<span class="photo-count">${photoText}</span>` : ''}
    ${moment.description ? `<p>${safeDescription.substring(0, 200)}${safeDescription.length > 200 ? '...' : ''}</p>` : ''}
    <a href="${momentUrl}">View Event Moments</a>
    <p class="redirect-message">Redirecting you to Event Moments...</p>
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
