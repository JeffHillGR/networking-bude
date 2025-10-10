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
  // Google Form ID from your form URL
  formId: '1kFhNVS4SibNh7lEmQ4Wa3nemcXjqTAipdZfjT3b9i5Q',

  // Map your form fields to Google Form entry IDs
  fields: {
    firstName: 'entry.1117301043',
    lastName: 'entry.1314103687',
    username: 'entry.1022375861',
    email: 'entry.881422099',
    jobTitle: 'entry.773169579',
    company: 'entry.73698066',
    zipCode: 'entry.453454424',
    industry: 'entry.1791763719',
    sameIndustry: 'entry.725471228',
    gender: 'entry.2116585712',
    genderPreference: 'entry.1496804582',
    dob: 'entry.541157477',
    dobPreference: 'entry.728961157',
    radius: 'entry.1756202424',
    organizations: 'entry.1775764512',
    organizationsOther: 'entry.1775764512.other_option_response',
    organizationsToCheckOut: 'entry.2000810861',
    organizationsToCheckOutOther: 'entry.2000810861.other_option_response',
    professionalInterests: 'entry.860860201',
    professionalInterestsOther: 'entry.860860201.other_option_response',
    personalInterests: 'entry.910288519',
    networkingGoals: 'entry.643686832'
  }
};

/**
 * Submits onboarding form data to Google Forms
 * @param {Object} formData - The form data object from OnboardingFlow
 * @returns {Promise<boolean>} - Success status
 */
export const submitToGoogleForms = async (formData) => {
  try {
    const formUrl = `https://docs.google.com/forms/d/${FORM_CONFIG.formId}/formResponse`;

    // Create URLSearchParams for form data
    const params = new URLSearchParams();

    // Map form data to Google Form entries
    Object.keys(FORM_CONFIG.fields).forEach(key => {
      const entryId = FORM_CONFIG.fields[key];
      let value = formData[key];

      // Handle arrays (organizations, interests) - each checkbox needs separate entry
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && item.toString().trim() !== '') {
            params.append(entryId, item);
          }
        });
        return;
      }

      // Only add non-empty values
      if (value && value.toString().trim() !== '') {
        params.append(entryId, value);
      }
    });

    // Submit using GET request (Google Forms accepts GET submissions)
    const getUrl = `https://docs.google.com/forms/d/${FORM_CONFIG.formId}/formResponse?${params.toString()}`;

    // Log submission details for debugging
    console.log('=== Google Forms Submission ===');
    console.log('Form ID:', FORM_CONFIG.formId);
    console.log('Submitting data:', formData);
    console.log('URL length:', getUrl.length);
    console.log('Full URL:', getUrl);
    console.log('===============================');

    await fetch(getUrl, {
      method: 'GET',
      mode: 'no-cors'
    });

    console.log('Form submitted to Google Forms successfully');
    return true;

  } catch (error) {
    console.error('Error submitting to Google Forms:', error);
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
