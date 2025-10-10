/**
 * Google Forms Integration Utility
 *
 * HOW TO SET UP:
 * 1. Create a Google Form with fields matching your onboarding data
 * 2. Click "Preview" (eye icon) on your Google Form
 * 3. Right-click → Inspect Element
 * 4. Find <input> tags and copy the "name" attributes (they look like "entry.123456789")
 * 5. Update the FORM_CONFIG below with your actual form ID and entry IDs
 */

const FORM_CONFIG = {
  // Replace with your Google Form ID (found in the form URL)
  // Example URL: https://docs.google.com/forms/d/YOUR_FORM_ID_HERE/edit
  formId: 'YOUR_FORM_ID_HERE',

  // Map your form fields to Google Form entry IDs
  // To find these: Preview form → Inspect → look for name="entry.XXXXXX" in input tags
  fields: {
    firstName: 'entry.123456789',      // Replace with actual entry ID
    lastName: 'entry.987654321',       // Replace with actual entry ID
    username: 'entry.111111111',       // Replace with actual entry ID
    email: 'entry.222222222',          // Replace with actual entry ID
    jobTitle: 'entry.333333333',       // Replace with actual entry ID
    industry: 'entry.444444444',       // Replace with actual entry ID
    sameIndustry: 'entry.555555555',   // Replace with actual entry ID
    gender: 'entry.666666666',         // Replace with actual entry ID
    genderPreference: 'entry.777777777', // Replace with actual entry ID
    dob: 'entry.888888888',            // Replace with actual entry ID
    dobPreference: 'entry.999999999',  // Replace with actual entry ID
    zipCode: 'entry.000000000',        // Replace with actual entry ID
    radius: 'entry.111111112',         // Replace with actual entry ID
    organizations: 'entry.222222223',  // Replace with actual entry ID
    organizationsToCheckOut: 'entry.333333334', // Replace with actual entry ID
    professionalInterests: 'entry.444444445',   // Replace with actual entry ID
    personalInterests: 'entry.555555556'        // Replace with actual entry ID
  }
};

/**
 * Submits onboarding form data to Google Forms
 * @param {Object} formData - The form data object from OnboardingFlow
 * @returns {Promise<boolean>} - Success status
 */
export const submitToGoogleForms = async (formData) => {
  try {
    const formUrl = `https://docs.google.com/forms/d/e/${FORM_CONFIG.formId}/formResponse`;

    // Create FormData object for submission
    const submitData = new FormData();

    // Map form data to Google Form entries
    Object.keys(FORM_CONFIG.fields).forEach(key => {
      const entryId = FORM_CONFIG.fields[key];
      let value = formData[key];

      // Handle arrays (organizations, interests) - join them as comma-separated
      if (Array.isArray(value)) {
        value = value.join(', ');
      }

      // Only add non-empty values
      if (value && value.toString().trim() !== '') {
        submitData.append(entryId, value);
      }
    });

    // Submit to Google Forms
    // Note: Using 'no-cors' mode means we won't get a response, but the form will submit
    await fetch(formUrl, {
      method: 'POST',
      body: submitData,
      mode: 'no-cors' // Required for Google Forms - won't return response data
    });

    // Since we can't verify the response with no-cors, we assume success
    console.log('Form submitted to Google Forms');
    return true;

  } catch (error) {
    console.error('Error submitting to Google Forms:', error);
    // Don't block user progress even if Google Forms fails
    return false;
  }
};

/**
 * Validates that the form is properly configured
 * @returns {boolean} - Whether configuration is valid
 */
export const isFormConfigured = () => {
  return FORM_CONFIG.formId !== 'YOUR_FORM_ID_HERE';
};

/**
 * Gets instructions for setting up Google Forms integration
 * @returns {string} - Setup instructions
 */
export const getSetupInstructions = () => {
  return `
Google Forms Setup Instructions:

1. Create a Google Form at https://forms.google.com
2. Add form fields matching your onboarding questions
3. Get your Form ID:
   - Open your form in edit mode
   - Copy the ID from URL: /forms/d/YOUR_FORM_ID/edit

4. Get Entry IDs:
   - Click the Preview button (eye icon)
   - Right-click → Inspect Element
   - Find <input> tags in the HTML
   - Copy the "name" attribute values (format: entry.XXXXXXXXX)

5. Update src/utils/googleForms.js:
   - Replace formId with your actual form ID
   - Replace each entry ID with the ones you found

6. Test by completing the onboarding flow

Note: Google Forms submissions use 'no-cors' mode, so you won't receive
confirmation responses, but the data will be submitted successfully.
  `;
};

export default {
  submitToGoogleForms,
  isFormConfigured,
  getSetupInstructions
};
