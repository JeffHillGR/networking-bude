# Vercel Environment Variables Setup

## Quick Setup Guide

Your Google Sheets API integration is failing because environment variables aren't configured in Vercel. Follow these steps:

## Step 1: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each of the following variables:

### Required Environment Variables

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_PROJECT_ID` | `bude-networking-app` |
| `GOOGLE_PRIVATE_KEY_ID` | `8407810cde11f8b9904d7caf8328227205165962` |
| `GOOGLE_PRIVATE_KEY` | See below ⬇️ |
| `GOOGLE_CLIENT_EMAIL` | `bude-sheets-writer@bude-networking-app.iam.gserviceaccount.com` |
| `GOOGLE_CLIENT_ID` | `102187501826510627099` |
| `GOOGLE_CERT_URL` | `https://www.googleapis.com/robot/v1/metadata/x509/bude-sheets-writer%40bude-networking-app.iam.gserviceaccount.com` |
| `GOOGLE_SHEET_ID` | **YOUR_SHEET_ID** (see instructions below) |

### GOOGLE_PRIVATE_KEY Value

**IMPORTANT**: Copy this ENTIRE block exactly as shown, including the BEGIN/END lines:

```
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCsGsoPQOhym+YY
RVj13atOAjOwtKh1vO3GLIEmwfcDFssj/8RB0grEJ04wxYMA0syZ4P/MrtgMT172
5ceoO0csAHn9HN6cP+m0xwYsA1hmgQDvzwdp22I97DMD0r9P87oSruIzm+tmgj8e
6Mg5byD5F+hy5B3KDKqjciEtb9hAy6hpKZNYIel2tI+zHUV0S35U/cw/MGvEuUir
Xzv7+lPxpKwVD4uYr4YfP4tevHSm+E9T9cMHVgpY2VvwZJCIlMryJ4u5Es8DwAhn
3NzpKKHqqOiZ1diCRinrYv6VihWSFayUok+rZUnHu2hO0tgTvQNl6FHBT8CgM4Os
noKARpO9AgMBAAECggEAFcfWJpQKVubP+eZc2dDR6y9wJz7VywC7/saHGcaWYjey
Qb4Osl3IqwZmaNm2OJZ0+kx1UwwVn4kz9X8jA3FtEm6FAblzmsaj5xMA/vT1bROK
cM78mzL+feO0mRlEyPOJau/jBLEI25JENr8zB8G+pIeYDWI9OuLbfY/mDwAGmDx4
REJKvbKWAok/4T1VpDTUWzLXr3pSMqJzFEqgN4mT+vWvwS+Zpg30ga/Nenm/doF1
ECyYUd5ZF9BgZFFFiU/o7zHR2/xRPPspFqT6L/g3mRytVWDLeDB54OQNpfnS74Vz
YBoSKqLtWuPLQIyvQageA9hMJKMIISbSIvekGKVGKQKBgQDy0HDqcNm/J22rNgNU
22rI8jMXRl5MPNGfv1lnKKgMbmgsV8GJPgibAaHjhulad+E6fVhHOgbeNzXNWvok
/+88v7lcdqfFCUGqxJB7DpS+hgDQGmfbqS0XcjTZwxPGCWs3+C2vP/9xjrEfs+vB
eEBcBaBvHRTv/FTGt1IZroemhwKBgQC1c1tKhDlMCscoUPzWUFQwyTqZPqOGp42a
RM01Pq236KvXH8lCz/QwU95Anp+exm1VW+dcXc1CiO6N4hixNeHMM/NOgGQWWK7y
OzedZTa/u7B6N4I1nEtRxH6f+a2IOTSk9eviJD/hTY+uRBw+uOPwxp8sgVC0u1xC
jSodnyVAmwKBgQDs2HEr3UQodxc8aAU74oL423cGfvdAOhrnTcixHTE+XvtyNW9s
pXvTZvY4b8JzIngpi1Zus6U7YHM0ikdxi8waX5E5Jexj/7F0FyQvRHvGlAN6+ibQ
VubK9fWja+t/wnQ5NfWp+iz64YrYN7IBF4D/weVKPP3NUT6ITwzgTCO5RQKBgQCC
VG5RErIZBXDRa4J/6UjfldoqMkzArl7OXPbMdM3QWCX9qc4k2Dt77vGnlofuQnZL
pmyC8rk5PiOi87BqsNoTk4kCbMP3LRHT2Wbz/bwacZSr5Gz5Vt7ex3VwMKVNQFGo
3x7j2sera8t1D2T+RE0tJ20zSVsPxbfZ8Y07o5DdWwKBgQDx4sxfyWvF7zEYUjfq
bzzkQt6rlrQNBuX32Xso5svrSgufrNlOsaPFgk3AkckjtyYIem40kvsU7lvZfiMv
CdrvP6a8V15qKve3FPAo18hN3JSTQbuuZA9nyUYfaLHl0VZvLZTPrQtLR1P6iI7L
ZqEitcfO3FXOuWIw7dQj3CkL+Q==
-----END PRIVATE KEY-----
```

**Note**: When you paste this into Vercel, it will automatically handle the newline characters. The code in `api/submit.js` line 46 converts `\\n` to actual newlines.

### Finding Your GOOGLE_SHEET_ID

1. Open your Google Sheet in your browser
2. Look at the URL - it will look like:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit
   ```
3. Copy the long string between `/d/` and `/edit` - that's your Sheet ID
4. In this example, the Sheet ID is: `1ABC123xyz456DEF789`

## Step 2: Share Your Google Sheet

Your service account needs permission to write to your sheet:

1. Open your Google Sheet
2. Click the **Share** button (top right)
3. Add this email address as an **Editor**:
   ```
   bude-sheets-writer@bude-networking-app.iam.gserviceaccount.com
   ```
4. Click **Send**

## Step 3: Verify Sheet Structure

Your Google Sheet needs two tabs (sheets) with these exact names:

1. **Form_Responses** - For onboarding form data
2. **Event_Suggestions** - For event suggestion data

### Form_Responses Tab - Column Headers (Row 1):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | First Name | Last Name | Username | Email | Job Title | Company | Industry | Same Industry | Gender | Gender Preference | DOB | DOB Connect | Zip Code | Organizations | Organizations Other | Organizations To Check Out | Organizations To Check Out Other | Professional Interests | Professional Interests Other | Personal Interests | Networking Goals |

### Event_Suggestions Tab - Column Headers (Row 1):

| A | B | C | D |
|---|---|---|---|
| Timestamp | Submitter Name | Submitter Email | Event URL |

## Step 4: Set Environment for All Deployments

In Vercel, make sure to select which environments these variables apply to:

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

This ensures the variables work in all deployment contexts.

## Step 5: Redeploy Your Application

After adding all environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Deployments**
3. Click the three dots on your latest deployment
4. Select **Redeploy**

Or simply push a new commit to trigger a deployment.

## Testing

After deployment:

1. Go to your app's onboarding flow
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet - you should see a new row with the data

## Troubleshooting

### Still getting errors?

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click on your deployment
   - Click on "Functions" tab
   - Look for `/api/submit` and `/api/submitEvent` logs

2. **Verify All Environment Variables**:
   - Go to Settings → Environment Variables
   - Make sure all 7 variables are set
   - Check for typos, especially in the private key

3. **Check Sheet Permissions**:
   - Make sure the service account email is added as an Editor
   - Verify the email is exactly: `bude-sheets-writer@bude-networking-app.iam.gserviceaccount.com`

4. **Verify Sheet Tab Names**:
   - Tab names are case-sensitive
   - Must be exactly: `Form_Responses` and `Event_Suggestions`

5. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages when submitting the form

### Common Errors

| Error | Solution |
|-------|----------|
| `Missing required fields` | Make sure all required form fields are filled out |
| `Failed to save form data` | Check that all environment variables are set correctly |
| `Requested entity was not found` | Verify your GOOGLE_SHEET_ID is correct |
| `The caller does not have permission` | Make sure you shared the sheet with the service account email |
| `Unable to parse range` | Check that your sheet tab names match exactly |

## Security Notes

- ⚠️ **Never commit the service account JSON file to your repository**
- ⚠️ **Never commit `.env` files with these credentials**
- ✅ These credentials should ONLY exist in Vercel's environment variables
- ✅ The service account only has access to Google Sheets (not other Google services)
- ✅ The service account can only access sheets that are explicitly shared with it

## Need Help?

If you're still experiencing issues:

1. Check the Vercel function logs for specific error messages
2. Verify each step above was completed correctly
3. Test your Google Sheet manually to ensure it's accessible
4. Make sure your Google Cloud project has the Sheets API enabled

---

**Last Updated**: October 2025
**Service Account**: bude-sheets-writer@bude-networking-app.iam.gserviceaccount.com
**Project ID**: bude-networking-app
