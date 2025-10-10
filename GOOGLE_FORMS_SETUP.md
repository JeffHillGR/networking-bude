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
- **Company** (Short answer - optional)
- **Zip Code** (Short answer)
- **Personal Interests** (Paragraph)
- **Industry** (Dropdown - optional)
- **Date of Birth** (Date - optional)
- **Same Industry Connect** (Multiple choice)
- **Gender** (Multiple choice - optional)
- **Gender Preference Connect** (Multiple choice)
- **DOB Connect** (Multiple choice)
- **Connecting Radius** (Multiple choice)
- **Organizations That Have Events I Like To Attend** (Checkboxes with "Other" option enabled)
- **Organizations That I've Wanted to Check Out** (Checkboxes with "Other" option enabled)
- **Professional Interests** (Checkboxes with "Other" option enabled)

## Step 2: Get Your Form ID

1. In your Google Form, click the **Send** button (top right)
2. Or copy from the URL when editing: `https://docs.google.com/forms/d/YOUR_FORM_ID_HERE/edit`
3. The Form ID is the long string between `/d/` and `/edit`

## Step 3: Add Dropdown and Checkbox Options

For questions with predefined choices, you'll need to add all the options:

### Industry (Dropdown):
```
Technology
Healthcare
Finance
Education
Manufacturing
Marketing
Real Estate
Law
Non-Profit
Government
Accounting
Consulting
Professional Development
Recruiting
Entrepreneur/Business Owner
Startup/Founder
Other
```

### Same Industry Connect (Multiple Choice):
```
Yes, Same Industry As Mine
No, Different Industry As Mine
My Industry or Other Industries
```

### Gender (Multiple Choice):
```
Male
Female
Non-binary
Prefer not to say
```

### Gender Preference Connect (Multiple Choice):
```
Same gender
Different gender
Any gender
```

### DOB Connect (Multiple Choice):
```
Similar Age (+/- 5 Years)
Similar Age (+/- 10 Years)
Older - Mentor
Younger - Mentee
No Preference
```

### Connecting Radius (Multiple Choice):
```
Less than 25 Miles
Less than 50 Miles
Less than 100 Miles
Same State
No Preference
```

### Organizations (Checkboxes - for both "Attend" and "Check Out" questions):
```
GR Chamber of Commerce
Rotary Club
CREW
GRYP
Economic Club of Grand Rapids
Create Great Leaders
Right Place
Bamboo
Hello West Michigan
CARWM
Creative Mornings
Athena
Inforum
Start Garden
```
**Enable "Add 'Other' option" for this question**

### Professional Interests (Checkboxes):
```
Technology
Marketing
Finance
Design
Sales
HR
Product Management
Data Science
Engineering
Consulting
Healthcare
Education
Real Estate
Legal
Media
Startup
AI/ML
Blockchain
Sustainability
Leadership
```
**Enable "Add 'Other' option" for this question**

## Step 4: Get Entry IDs for Each Field

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

## Step 5: Configure the Integration

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

## Step 6: Test the Integration

1. Run your development server: `npm run dev`
2. Go through the onboarding flow
3. Fill out all fields and submit
4. Check your Google Form responses to verify the data was received

## Step 7: Connect to Google Sheets (Optional)

1. In your Google Form, click the **Responses** tab
2. Click the Google Sheets icon (green with white cross)
3. Create a new spreadsheet or select an existing one
4. All form submissions will now automatically populate your sheet

## Important Notes

- **No CORS Response**: The integration uses `mode: 'no-cors'`, which means you won't receive a confirmation response from Google Forms. This is normal and the data will still be submitted successfully.

- **"Other" Options**: For checkbox questions (Organizations and Professional Interests), make sure to enable the "Add 'Other' option" feature:
  1. Click the ⋮ (three dots) in the bottom right of the checkbox question
  2. Select "Add 'Other' option"
  3. This allows users to specify custom values not in your predefined list
  4. The integration automatically handles `.other_option_response` fields

- **Privacy**: Make sure your Google Form privacy settings align with your app's privacy policy.

- **Form Fields**: The form fields in Google Forms don't need to be in the same order as your onboarding flow, but the names should match for better organization.

- **Optional Fields**: Some fields in your onboarding are optional. Users who skip these fields won't have data submitted for those entries.

- **Arrays**: Fields like organizations and professional interests are arrays. They will be joined with commas when submitted to Google Forms.

- **Password Security**: Passwords are NOT sent to Google Forms for security reasons. Only profile information is submitted.

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
- Company (optional)
- Industry (optional)
- Same Industry Connect

**Section 3: Demographics (Optional)**
- Gender (optional)
- Gender Preference Connect
- Date of Birth (optional)
- DOB Connect

**Section 4: Location**
- Zip Code
- Connecting Radius

**Section 5: Organizations**
- Organizations That Have Events I Like To Attend (with "Other" option)
- Organizations That I've Wanted to Check Out (with "Other" option)

**Section 6: Interests**
- Professional Interests (with "Other" option)
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
