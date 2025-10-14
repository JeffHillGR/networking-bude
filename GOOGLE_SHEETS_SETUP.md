# Google Sheets API Setup Guide (Vercel Serverless Function)

This guide will help you set up the Google Sheets API integration using a Vercel serverless function. This replaces the unreliable Google Forms direct submission method.

## Why This Approach?

**Previous Issue:** Google Forms doesn't reliably accept programmatic submissions (creates empty rows)

**New Solution:** Official Google Sheets API v4 with service account authentication
- ✅ Reliable data submission
- ✅ Full control over data structure
- ✅ Confirmation responses
- ✅ Error handling
- ✅ No CORS issues

---

## Part 1: Google Cloud Setup (~15-20 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `BudE Networking App`
5. Click **"Create"**
6. Wait for the project to be created (you'll see a notification)
7. Make sure the new project is selected in the dropdown

### Step 2: Enable Google Sheets API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
   - Or use direct link: https://console.cloud.google.com/apis/library
2. Search for `Google Sheets API`
3. Click on **"Google Sheets API"**
4. Click **"Enable"**
5. Wait for it to be enabled (~10 seconds)

### Step 3: Create Service Account

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
   - Or use direct link: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"Service Account"**
4. Fill in the details:
   - **Service account name:** `bude-sheets-writer`
   - **Service account ID:** (auto-generated, leave as is)
   - **Description:** `Service account for writing onboarding data to Google Sheets`
5. Click **"Create and Continue"**
6. **Grant this service account access to project:**
   - Skip this (click **"Continue"**)
7. **Grant users access to this service account:**
   - Skip this (click **"Done"**)

### Step 4: Create Service Account Key (JSON)

1. You should now see your service account in the list
2. Click on the service account email (e.g., `bude-sheets-writer@...`)
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will download automatically
   - **IMPORTANT:** Keep this file secure! It contains authentication credentials
   - **File name:** Something like `bude-networking-app-xxxxx.json`

### Step 5: Share Google Sheet with Service Account

1. Open the downloaded JSON file in a text editor
2. Find and copy the `client_email` value
   - Example: `bude-sheets-writer@bude-networking-app.iam.gserviceaccount.com`
3. Open your Google Sheet (the one connected to your Google Form)
4. Click the **"Share"** button (top right)
5. Paste the service account email
6. Set permission to **"Editor"**
7. **Uncheck** "Notify people" (it's a service account, not a person)
8. Click **"Share"**

---

## Part 2: Vercel Environment Variables (~5 minutes)

You need to add the credentials from the JSON file to Vercel as environment variables.

### Step 1: Get Your Google Sheet ID

1. Open your Google Sheet
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
3. The Sheet ID is the long string between `/d/` and `/edit`

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on **"Settings"** tab
3. Click on **"Environment Variables"** in the left sidebar
4. Add the following variables (one at a time):

**Open your downloaded JSON file and find these values:**

| Variable Name | Where to Find in JSON | Example Value |
|---------------|----------------------|---------------|
| `GOOGLE_SHEET_ID` | Not in JSON - from URL above | `1kFhNVS4SibNh7lEmQ4Wa3nemcXjqTAipdZfjT3b9i5Q` |
| `GOOGLE_PROJECT_ID` | `project_id` | `bude-networking-app` |
| `GOOGLE_PRIVATE_KEY_ID` | `private_key_id` | `abc123def456...` |
| `GOOGLE_PRIVATE_KEY` | `private_key` | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_CLIENT_EMAIL` | `client_email` | `bude-sheets-writer@...iam.gserviceaccount.com` |
| `GOOGLE_CLIENT_ID` | `client_id` | `123456789012345678901` |
| `GOOGLE_CERT_URL` | `client_x509_cert_url` | `https://www.googleapis.com/robot/v1/metadata/x509/...` |

**For each variable:**
1. Enter the **Name** (e.g., `GOOGLE_SHEET_ID`)
2. Enter the **Value** (copy from JSON or Sheet URL)
3. Select environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
4. Click **"Save"**

**⚠️ IMPORTANT for `GOOGLE_PRIVATE_KEY`:**
- Copy the ENTIRE private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep all the `\n` characters (they represent line breaks)
- The value should look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...`

### Step 3: Verify Environment Variables

After adding all 7 variables, you should see:
- ✅ GOOGLE_SHEET_ID
- ✅ GOOGLE_PROJECT_ID
- ✅ GOOGLE_PRIVATE_KEY_ID
- ✅ GOOGLE_PRIVATE_KEY
- ✅ GOOGLE_CLIENT_EMAIL
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CERT_URL

---

## Part 3: Install Dependencies

The serverless function needs the Google APIs Node.js client library.

```bash
npm install googleapis
```

This will be added to your `package.json` dependencies.

---

## Part 4: Update React Form (Already Done for You)

The `OnboardingFlow.jsx` component has been updated to use the new API endpoint instead of direct Google Forms submission.

**Key changes:**
- Submits to `/api/submit` instead of Google Forms URL
- Uses `fetch()` with POST method
- Receives confirmation response
- Better error handling

---

## Part 5: Deploy and Test

### Deploy to Vercel

```bash
git add .
git commit -m "Add Google Sheets API serverless function"
git push
```

Vercel will automatically deploy your changes.

### Test the Integration

1. Go to your deployed site
2. Complete the onboarding flow
3. Submit the form
4. Check your Google Sheet - you should see a new row with all the data
5. Check Vercel logs to see the function execution

**To view Vercel logs:**
1. Go to your Vercel dashboard
2. Click on your project
3. Go to **"Functions"** tab
4. Click on `/api/submit`
5. View the logs to see successful submissions or errors

---

## Part 6: Local Development Testing

To test the serverless function locally, you need to add the environment variables to your local environment.

### Option 1: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Link your local project to Vercel
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local
```

This creates a `.env.local` file with all your environment variables.

### Option 2: Manual .env.local File

Create a `.env.local` file in your project root:

```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_PROJECT_ID=your_project_id_here
GOOGLE_PRIVATE_KEY_ID=your_private_key_id_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account_email_here
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CERT_URL=your_cert_url_here
```

**⚠️ IMPORTANT:**
- Add `.env.local` to your `.gitignore` (should already be there)
- Never commit this file to git!

### Run Local Development Server

```bash
npm run dev
```

Then test by going through the onboarding flow at `http://localhost:5174`

---

## Troubleshooting

### Error: "Failed to save form data"

**Check:**
1. All environment variables are set correctly in Vercel
2. Service account email is shared with the Google Sheet (with Editor permission)
3. Google Sheets API is enabled in Google Cloud Console
4. The `GOOGLE_PRIVATE_KEY` includes the full key with `\n` characters

**View detailed logs:**
- Vercel Dashboard → Your Project → Functions → `/api/submit` → Logs

### Error: "Missing required fields"

**Cause:** Required fields (firstName, lastName, email, username) were not submitted

**Fix:** Make sure these fields are filled out in the form

### Error: "Method not allowed"

**Cause:** Trying to access the endpoint with GET instead of POST

**Fix:** The React form should be using POST (already configured)

### Data not appearing in Google Sheet

**Check:**
1. Verify the `GOOGLE_SHEET_ID` environment variable matches your sheet
2. Verify the sheet name in the code matches your Google Sheet tab name
   - Default: `Form Responses 1`
   - Update in `api/submit.js` if your sheet has a different name
3. Check Vercel function logs for errors

### "Permission denied" error

**Cause:** Service account doesn't have access to the Google Sheet

**Fix:**
1. Open your Google Sheet
2. Click Share
3. Add the service account email with Editor permission

---

## Sheet Structure

The serverless function expects your Google Sheet to have these columns (in this order):

1. Timestamp
2. First Name
3. Last Name
4. Username
5. Email
6. Job Title
7. Company
8. Zip Code
9. Industry
10. Same Industry Connect
11. Gender
12. Gender Preference Connect
13. Date of Birth
14. DOB Connect
15. Organizations (Attend)
16. Organizations Other
17. Organizations (Check Out)
18. Organizations Check Out Other
19. Professional Interests
20. Professional Interests Other
21. Personal Interests
22. Networking Goals

If your Google Form created a sheet with these columns already, you're all set! If not, you can:
- Add the headers manually
- Or adjust the column order in `api/submit.js` to match your sheet

---

## Security Best Practices

1. ✅ **Never commit credentials to git**
   - The `.env.local` file is already in `.gitignore`
   - The JSON key file should NOT be in your repository

2. ✅ **Use environment variables for all sensitive data**
   - Credentials are stored in Vercel (encrypted)
   - Not in your code

3. ✅ **Limit service account permissions**
   - Only has access to Google Sheets API
   - Only has Editor permission on the specific sheet

4. ✅ **Rotate keys periodically**
   - Can create new service account keys in Google Cloud Console
   - Delete old keys after updating Vercel environment variables

---

## Cost

**Google Cloud:**
- ✅ **Free** - Google Sheets API has generous free tier
- No billing account needed for this usage level

**Vercel:**
- ✅ **Included in Pro plan** ($20/month)
- Serverless function invocations: 1M/month included
- For beta testing with <100 users: well within free limits

---

## Benefits Over Google Forms Direct Submission

✅ **Reliable** - Official API, no empty rows
✅ **Confirmation** - Get success/error responses
✅ **Validation** - Server-side validation before saving
✅ **Control** - Full control over data structure
✅ **Professional** - No CORS workarounds or "no-cors" mode
✅ **Debugging** - Detailed logs in Vercel dashboard
✅ **Scalable** - Can easily add database later

---

## Migration Path to Full Database

When you're ready to move beyond Google Sheets:

1. Keep the serverless function structure
2. Replace Google Sheets API calls with database calls (PostgreSQL, MongoDB, etc.)
3. No changes needed to the React frontend
4. The `/api/submit` endpoint stays the same

---

## Support

If you encounter issues:

1. **Check Vercel Logs:** Most helpful for debugging
2. **Verify Environment Variables:** Make sure all 7 are set
3. **Test Sheet Access:** Manually add a row to verify permissions
4. **Check Google Cloud Console:** Verify API is enabled
5. **Review Service Account:** Verify it's shared with the sheet

---

**Last Updated:** October 10, 2025
**Migration:** From Google Forms direct submission to Google Sheets API
**Reason:** Google Forms doesn't reliably accept programmatic submissions
