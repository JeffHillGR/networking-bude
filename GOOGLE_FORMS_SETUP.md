# Google Forms Integration Setup Guide

This guide will help you connect your BudE onboarding form to Google Forms so all user responses are automatically collected in a Google Sheet.

## Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form
3. Add questions matching each field in your onboarding flow:

### Required Fields to Add:
- **First Name** (Short answer)
- **Last Name** (Short answer)
- **Username** (Short answer)
- **Email** (Short answer)
- **Job Title** (Short answer)
- **Industry** (Dropdown)
- **Same Industry Preference** (Multiple choice)
- **Gender** (Multiple choice - optional)
- **Gender Preference** (Multiple choice)
- **Date of Birth** (Date - optional)
- **DOB Preference** (Multiple choice)
- **Zip Code** (Short answer)
- **Connection Radius** (Multiple choice)
- **Organizations I Attend** (Checkboxes)
- **Organizations to Check Out** (Checkboxes)
- **Professional Interests** (Checkboxes)
- **Personal Interests** (Paragraph)

## Step 2: Get Your Form ID

1. In your Google Form, click the **Send** button (top right)
2. Or copy from the URL when editing: `https://docs.google.com/forms/d/YOUR_FORM_ID_HERE/edit`
3. The Form ID is the long string between `/d/` and `/edit`

## Step 3: Get Entry IDs for Each Field

1. Click the **Preview** button (eye icon) in your Google Form
2. Right-click anywhere on the preview page → **Inspect Element**
3. In the developer tools, press `Ctrl+F` (Windows) or `Cmd+F` (Mac) to search
4. Search for `entry.` to find all entry fields
5. For each `<input>` or `<textarea>` tag, copy the `name` attribute value
   - Example: `<input name="entry.123456789">` → copy `entry.123456789`

### Field Mapping:
Make a list like this:
```
First Name: entry.123456789
Last Name: entry.987654321
Username: entry.111111111
Email: entry.222222222
... (continue for all fields)
```

## Step 4: Configure the Integration

1. Open `src/utils/googleForms.js`
2. Replace `YOUR_FORM_ID_HERE` with your actual Form ID from Step 2
3. Update each entry ID in the `fields` object with the values from Step 3

Example:
```javascript
const FORM_CONFIG = {
  formId: '1FAIpQLSdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Your actual form ID

  fields: {
    firstName: 'entry.123456789',      // Your actual entry ID
    lastName: 'entry.987654321',       // Your actual entry ID
    username: 'entry.111111111',       // Your actual entry ID
    email: 'entry.222222222',          // Your actual entry ID
    // ... continue for all fields
  }
};
```

## Step 5: Test the Integration

1. Run your development server: `npm run dev`
2. Go through the onboarding flow
3. Fill out all fields and submit
4. Check your Google Form responses to verify the data was received

## Step 6: Connect to Google Sheets (Optional)

1. In your Google Form, click the **Responses** tab
2. Click the Google Sheets icon (green with white cross)
3. Create a new spreadsheet or select an existing one
4. All form submissions will now automatically populate your sheet

## Important Notes

- **No CORS Response**: The integration uses `mode: 'no-cors'`, which means you won't receive a confirmation response from Google Forms. This is normal and the data will still be submitted successfully.

- **Privacy**: Make sure your Google Form privacy settings align with your app's privacy policy.

- **Form Fields**: The form fields in Google Forms don't need to be in the same order as your onboarding flow, but the names should match for better organization.

- **Optional Fields**: Some fields in your onboarding are optional. Users who skip these fields won't have data submitted for those entries.

- **Arrays**: Fields like organizations and professional interests are arrays. They will be joined with commas when submitted to Google Forms.

## Troubleshooting

### Data Not Appearing in Google Forms?

1. **Check Form ID**: Make sure the Form ID is correct (no extra characters or spaces)
2. **Check Entry IDs**: Verify all entry IDs match exactly (case-sensitive)
3. **Check Browser Console**: Open Developer Tools → Console to see any error messages
4. **Test Form Directly**: Try submitting the Google Form manually to ensure it works

### Form Configuration Warning

If you see a console warning about "Google Forms not configured", it means the Form ID hasn't been updated from the default placeholder value.

## Example Google Form Structure

Here's a suggested structure for your Google Form:

**Section 1: Basic Information**
- First Name
- Last Name
- Username
- Email

**Section 2: Professional Details**
- Job Title
- Industry
- Same Industry Preference

**Section 3: Demographics (Optional)**
- Gender
- Gender Preference
- Date of Birth
- DOB Preference

**Section 4: Location**
- Zip Code
- Connection Radius

**Section 5: Organizations**
- Organizations I Attend
- Organizations to Check Out

**Section 6: Interests**
- Professional Interests
- Personal Interests

## Security Considerations

- **Passwords**: Note that passwords are NOT sent to Google Forms for security reasons
- **Email Validation**: Consider enabling email collection in Google Forms settings
- **Response Limits**: Google Forms has no response limits for free accounts

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Form ID and Entry IDs are correct
3. Test the Google Form manually first
4. Review the code in `src/utils/googleForms.js`
