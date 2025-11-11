# Mailpit Setup for Local Email Testing

## Quick Start

1. **Start Supabase (includes Mailpit)**
   ```bash
   supabase start
   ```

2. **Start Supabase Functions**
   ```bash
   # In your project directory
   supabase functions serve --env-file supabase/.env
   ```

3. **View Email Interface**
   Open http://localhost:54324 in your browser

## Testing the Email Flow

1. **Send a Connection Request**
   - Use your local app to send a connection request
   - The Edge Function will automatically detect local environment
   - Emails will be sent to Mailpit instead of Resend

2. **Check Emails in Mailpit**
   - Go to http://localhost:54324
   - You'll see all sent emails organized by recipient
   - Click on emails to view HTML content
   - Test the "View Profile & Respond" link

## Environment Detection

The function automatically detects local environment when:
- `SUPABASE_URL` contains "localhost", OR  
- `ENVIRONMENT` env var is set to "local"

## Logs to Watch

In your Supabase functions terminal, look for:
- `🧪 Using Mailpit for local email testing`
- `✅ Connection email sent via Mailpit`
- `📧 View at: http://localhost:54324`

## Troubleshooting

**Mailpit not receiving emails?**
- Check if Supabase is running: `supabase status`
- Restart Supabase: `supabase stop && supabase start`
- Check function logs for connection attempts

**Emails still going to Resend?**
- Verify your `SUPABASE_URL` contains "localhost"
- Or set `ENVIRONMENT=local` in your function environment

**Docker connectivity issues?**
- The function tries multiple network approaches
- Check logs to see which URL succeeded

## Benefits

✅ **No real emails sent during development**  
✅ **Test email formatting and links**  
✅ **Faster feedback loop**  
✅ **Works offline**  
✅ **Automatic environment detection**