import React, { useState } from 'react';
import { User, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BudEOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Prevent scroll restoration on mobile
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Set viewport to prevent zooming on input focus - this is KEY
    const viewport = document.querySelector('meta[name=viewport]');
    const originalContent = viewport?.getAttribute('content');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }

    return () => {
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
    };
  }, []);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showBetaTerms, setShowBetaTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    jobTitle: '',
    company: '',
    industry: '',
    sameIndustry: '',
    gender: '',
    genderPreference: '',
    dob: '',
    dobPreference: '',
    zipCode: '',
    radius: '',
    organizations: [],
    organizationsOther: '',
    organizationsToCheckOut: [],
    organizationsToCheckOutOther: '',
    professionalInterests: [],
    professionalInterestsOther: '',
    personalInterests: '',
    networkingGoals: ''
  });

  const organizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'CARWM', 'Creative Mornings', 'Athena',
    'Inforum', 'Start Garden', 'GRABB', 'WMPRSA', 'Crain\'s GR Business', 'AIGA - WM'
  ];

  const professionalInterestOptions = [
    'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR',
    'Product Management', 'Data Science', 'Engineering', 'Consulting',
    'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media',
    'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership',
    'Coding', 'AI'
  ];

  const jobTitleSuggestions = [
    'Software Engineer',
    'Marketing Manager',
    'Sales Director',
    'Product Manager',
    'Data Analyst',
    'Graphic Designer',
    'Financial Analyst',
    'Business Development Manager',
    'HR Manager',
    'Project Manager',
    'Operations Manager',
    'Account Executive',
    'Content Marketing Manager',
    'UX/UI Designer',
    'Entrepreneur',
    'CEO',
    'CFO',
    'CTO',
    'Vice President',
    'Director',
    'Consultant',
    'Accountant',
    'Real Estate Agent',
    'Attorney',
    'Physician',
    'Nurse',
    'Teacher',
    'Professor',
    'Developer',
    'DevOps Engineer',
    'Product Designer',
    'Brand Manager',
    'Digital Marketing Specialist',
    'Social Media Manager',
    'Customer Success Manager',
    'Business Analyst',
    'Recruiter',
    'Founder',
    'Executive Director',
    'Non-Profit Director'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleJobTitleChange = (value) => {
    setFormData(prev => ({ ...prev, jobTitle: value }));

    if (value.length > 0) {
      const filtered = jobTitleSuggestions.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredJobTitles(filtered);
      setShowJobTitleSuggestions(filtered.length > 0);
    } else {
      setShowJobTitleSuggestions(false);
      setFilteredJobTitles([]);
    }
  };

  const selectJobTitle = (title) => {
    setFormData(prev => ({ ...prev, jobTitle: title }));
    setShowJobTitleSuggestions(false);
    setFilteredJobTitles([]);
  };

  const toggleOrganization = (org) => {
    setFormData(prev => ({
      ...prev,
      organizations: prev.organizations.includes(org)
        ? prev.organizations.filter(o => o !== org)
        : [...prev.organizations, org]
    }));
  };

  const toggleProfessionalInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      professionalInterests: prev.professionalInterests.includes(interest)
        ? prev.professionalInterests.filter(i => i !== interest)
        : [...prev.professionalInterests, interest]
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit to Google Sheets via Vercel serverless function
      console.log('📤 Submitting form data to Google Sheets API...');

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await response.json();
      console.log('✅ Form submitted successfully:', result);

      // Save to localStorage (existing behavior)
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('userFirstName', formData.firstName);
      localStorage.setItem('userLastName', formData.lastName);
      localStorage.setItem('userJobTitle', formData.jobTitle);
      localStorage.setItem('userIndustry', formData.industry);

      // Save complete onboarding data for profile page
      localStorage.setItem('onboardingData', JSON.stringify(formData));

      // Show success popup
      setShowSuccessPopup(true);

      // Navigate to dashboard after 4 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
    } catch (error) {
      console.error('❌ Error submitting to Google Sheets:', error);

      // Store form data in localStorage as backup
      localStorage.setItem('lastFormSubmission', JSON.stringify({
        ...formData,
        submittedAt: new Date().toISOString(),
        error: error.message
      }));

      // Still save user data to localStorage for dashboard access
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('userFirstName', formData.firstName);
      localStorage.setItem('userLastName', formData.lastName);
      localStorage.setItem('userJobTitle', formData.jobTitle);
      localStorage.setItem('userIndustry', formData.industry);

      // Save complete onboarding data for profile page
      localStorage.setItem('onboardingData', JSON.stringify(formData));

      // Show success popup even if API fails (data is saved locally)
      setShowSuccessPopup(true);

      // Navigate to dashboard after 4 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const BudELogo = () => (
  <img 
  src="/BudE-Logo-Final.png"
  alt="BudE Logo" 
  className="h-16.5 w-auto"
/>
  );


 const renderWelcome = () => (
  <div className="h-full md:min-h-screen flex flex-col md:flex-row">
    {/* Left side - Images - Hidden on mobile */}
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 px-12 pb-12 items-start justify-end">
      <div className="relative pt-8">
        {/* Large phone image */}
        <div className="flex flex-col items-center">
          <div className="w-[500px] h-[620px] rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/My-phone-2.jpg"
              alt="BudE app on phone"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 text-white text-3xl font-bold drop-shadow-lg">
            </div>

            {/* Three small images stacked at bottom right inside phone */}
            <div className="absolute right-6 bottom-6 space-y-3">
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg border-3 border-white">
               <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/People-networking-1.png" alt="Networking" className="w-full h-full object-cover" />
              </div>
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg border-3 border-white">
               <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/People-networking-3.png" alt="Networking" className="w-full h-full object-cover" />
              </div>
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg border-3 border-white">
                <img src="/People-networking-2.png" alt="Networking" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Networking BudE by The BudE System™</p>
        </div>
      </div>
    </div>

    {/* Right side - Form - Full width on mobile, half on desktop */}
    <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center bg-white overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', minHeight: '100dvh' }}>
      <div className="max-w-lg w-full pb-16">
        <div className="flex justify-center mb-3">
          <BudELogo />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Welcome to<br />Networking BudE
        </h1>

        <h3 className="text-sm md:text-base font-semibold text-center mb-3">Ready to jump in? Let's set up your profile.</h3>

        {/* Beta Device Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-3">
          <p className="text-xs md:text-sm text-blue-800 text-center">
            <span className="font-semibold">Beta Testing:</span> Please use the same device and browser to access your account during the beta period.
          </p>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div className="w-1/3 h-full bg-black rounded-full"></div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Preferred Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold">Password <span className="text-red-500">*</span></label>
              <button
                type="button"
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <span>Password requirements</span>
                {showPasswordRequirements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-2 pr-10 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showPasswordRequirements && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="font-semibold text-gray-900 mb-2">Create a strong password</p>
                <p className="text-gray-700 mb-1">Your password must be at least 12 characters and include:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>One uppercase letter (A–Z)</li>
                  <li>One lowercase letter (a–z)</li>
                  <li>One number (0–9)</li>
                  <li>One special character (!, @, #, etc.)</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                alert('Please fill in all required fields (First Name, Last Name, Email, and Password)');
              } else if (!isValidEmail(formData.email)) {
                alert('Please enter a valid email address');
              } else {
                setStep(1);
              }
            }}
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !isValidEmail(formData.email)}
            className="bg-black text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>

        {/* Mobile Branding - Only visible on mobile */}
        <p className="md:hidden text-center text-xs text-gray-600 mt-6 pb-4">
          Networking BudE by The BudE System™
        </p>
      </div>
    </div>
  </div>
);



  const renderStep1 = () => (
    <div className="h-full md:min-h-screen flex flex-col md:flex-row">
   {/* Left side - Images - Hidden on mobile */}
   <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 px-12 pb-12 items-start justify-end">
      <div className="relative pt-8">
        {/* Phone image with single inset */}
        <div className="flex flex-col items-center">
          <div className="w-[500px] h-[620px] rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/My-phone-2.jpg"
              alt="BudE app on phone"
              className="w-full h-full object-cover"
            />
            {/* Single inset image at bottom right inside phone */}
            <div className="absolute right-6 bottom-6">
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg border-3 border-white">
               <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/People-networking-1.png" alt="Networking" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Networking BudE by The BudE System™</p>
        </div>
      </div>
    </div>

      {/* Right side - Form - Full width on mobile */}
      <div className="w-full md:w-1/2 p-4 md:p-12 flex items-center justify-center bg-white overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', minHeight: '100dvh' }}>
        <div className="max-w-lg w-full pb-16">
          <div className="flex justify-center mb-4">
            <BudELogo />
          </div>

          <h1 className="text-3xl font-bold text-center mb-5">
            Welcome to<br />Networking BudE
          </h1>

          <div className="flex gap-2 mb-5">
            <div className="flex-1 h-2 bg-black rounded-full"></div>
            <div className="flex-1 h-2 bg-black rounded-full"></div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Job Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Or what you are known for"
                value={formData.jobTitle}
                onChange={(e) => handleJobTitleChange(e.target.value)}
                onFocus={() => {
                  if (formData.jobTitle.length > 0) {
                    const filtered = jobTitleSuggestions.filter(title =>
                      title.toLowerCase().includes(formData.jobTitle.toLowerCase())
                    );
                    setFilteredJobTitles(filtered);
                    setShowJobTitleSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowJobTitleSuggestions(false), 200);
                }}
              />
              {/* Fixed height container to prevent layout shift */}
              <div className="relative h-0">
                {showJobTitleSuggestions && filteredJobTitles.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredJobTitles.slice(0, 10).map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectJobTitle(title)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Company (optional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Industry (optional)</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                >
                  
                  <option value="">Select your industry</option>
                  <option value="accounting">Accounting</option>
                  <option value="construction">Construction</option>
                  <option value="consulting">Consulting</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="entrepreneur">Entrepreneur/Business Owner</option>
                  <option value="events">Events</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="government">Government</option>
                  <option value="law">Law</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="marketing">Marketing</option>
                  <option value="media">Media</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="professional development">Professional Development</option>
                  <option value="real estate">Real Estate</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="startup">Startup/Founder</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Same Industry Connect</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.sameIndustry}
                  onChange={(e) => handleChange('sameIndustry', e.target.value)}
                >
                  <option value="">Choose preference</option>
                  <option value="Yes">Yes, Same Industry As Mine</option>
                  <option value="No">No, Different Industry As Mine</option>
                  <option value="Either">My Industry or Other Industries</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Gender (optional)</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value=""></option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Gender Preference Connect?</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.genderPreference}
                  onChange={(e) => handleChange('genderPreference', e.target.value)}
                >
                  <option value="">Select preference</option>
                  <option value="same">Same gender</option>
                  <option value="different">Different gender</option>
                  <option value="any">Any gender</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">DOB (optional)</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">DOB Connect?</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.dobPreference}
                  onChange={(e) => handleChange('dobPreference', e.target.value)}
                >
                  <option value="">Select age preference</option>
                  <option value="similar5">Similar Age (+/- 5 Years)</option>
                  <option value="similar10">Similar Age (+/- 10 Years)</option>
                  <option value="Mentor">Older - Mentor</option>
                  <option value="Mentee">Younger - Mentee</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Zip Code</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Where You Can Find Me Networking Now</label>
              <div className="flex flex-wrap gap-1.5">
                {organizations.map(org => (
                  <button
                    key={org}
                    onClick={() => toggleOrganization(org)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.organizations.includes(org)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Other organization (please specify)"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.organizationsOther}
                  onChange={(e) => handleChange('organizationsOther', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Organizations That I've Wanted to Check Out</label>
              <div className="flex flex-wrap gap-1.5">
                {organizations.map(org => (
                  <button
                    key={`checkout-${org}`}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        organizationsToCheckOut: prev.organizationsToCheckOut?.includes(org)
                          ? prev.organizationsToCheckOut.filter(o => o !== org)
                          : [...(prev.organizationsToCheckOut || []), org]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.organizationsToCheckOut?.includes(org)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Other organization (please specify)"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.organizationsToCheckOutOther}
                  onChange={(e) => handleChange('organizationsToCheckOutOther', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(0)}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
           <button
              onClick={() => {
                       setStep(2);
                      window.scrollTo(0, 0);
  }}
  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
>
  Continue
</button>
          </div>

          {/* Mobile Branding - Only visible on mobile */}
          <p className="md:hidden text-center text-xs text-gray-600 mt-6 pb-4">
            Networking BudE by The BudE System™
          </p>
        </div>
      </div>
    </div>
  );

const renderStep2 = () => (
  <div className="h-full md:min-h-screen flex flex-col md:flex-row">
    {/* Left side - Images - Hidden on mobile */}
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 px-12 pb-12 items-start justify-end">
      <div className="relative pt-8">
        {/* Phone image with single inset */}
        <div className="flex flex-col items-center">
          <div className="w-[500px] h-[620px] rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/My-phone-2.jpg"
              alt="BudE app on phone"
              className="w-full h-full object-cover"
            />
            {/* Single inset image at bottom right inside phone */}
            <div className="absolute right-6 bottom-6">
              <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg border-3 border-white">
               <img src="/People-networking-2.png" alt="Networking" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Networking BudE by The BudE System™</p>
        </div>
      </div>
    </div>

    {/* Right side - Form - Full width on mobile */}
    <div className="w-full md:w-1/2 p-4 md:p-12 flex items-center justify-center bg-white overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch', minHeight: '100dvh' }}>
      <div className="max-w-lg w-full pb-16">
        <div className="flex justify-center mb-4">
          <BudELogo />
        </div>

        <h1 className="text-3xl font-bold text-center mb-5">
          Welcome to<br />Networking BudE
        </h1>

        <div className="flex gap-2 mb-5">
          <div className="flex-1 h-2 bg-black rounded-full"></div>
          <div className="flex-1 h-2 bg-black rounded-full"></div>
          <div className="flex-1 h-2 bg-black rounded-full"></div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1.5">Professional Interests</h2>
            <p className="text-gray-600 mb-2 text-sm">Select the professional areas that interest you most</p>
            <div className="flex flex-wrap gap-1.5">
              {professionalInterestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleProfessionalInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    formData.professionalInterests.includes(interest)
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Other professional interest (please specify)"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.professionalInterestsOther}
                onChange={(e) => handleChange('professionalInterestsOther', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-1.5">Personal Interests</h2>
            <p className="text-gray-600 mb-2 text-sm">
              What keeps you busy in your spare time? This helps create more meaningful connections beyond just professional interests.
            </p>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24 text-sm"
              placeholder="Tell us about your personal interests..."
              value={formData.personalInterests}
              onChange={(e) => handleChange('personalInterests', e.target.value)}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-2">{formData.personalInterests.length}/500 characters</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Networking Goal</h2>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24 text-sm"
              placeholder="What are you looking for?"
              value={formData.networkingGoals}
              onChange={(e) => handleChange('networkingGoals', e.target.value)}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-2">{formData.networkingGoals.length}/500 characters</p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create My Account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          By creating an account, you agree to our{' '}
          <button
            onClick={() => setShowBetaTerms(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            Beta Terms
          </button>
        </p>

        {/* Mobile Branding - Only visible on mobile */}
        <p className="md:hidden text-center text-xs text-gray-600 mt-6 pb-4">
          Networking BudE by The BudE System™
        </p>
      </div>
    </div>
  </div>
);

  const steps = [renderWelcome, renderStep1, renderStep2];

  return (
    <>
      {steps[step]()}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all">
            <div className="w-16 h-16 bg-[#009900] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600">
              Now let's find some connections and events for you
            </p>
          </div>
        </div>
      )}

      {/* Beta Terms Modal */}
      {showBetaTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                🧪 Beta Testing - Your Privacy Matters
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>We're testing BudE with a small group in Michigan. Your information is:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Stored securely for beta testing only</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Never sold or shared with third parties</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Used only to improve your experience (we'll email you a survey for feedback)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Will be deleted after beta if you request</p>
                  </div>
                </div>
                <p className="pt-3 text-center">
                  <span className="font-semibold">Questions?</span> Email us at{' '}
                  <a href="mailto:grjeff@gmail.com" className="text-blue-600 hover:underline">
                    grjeff@gmail.com
                  </a>
                </p>
              </div>
              <button
                onClick={() => setShowBetaTerms(false)}
                className="w-full mt-6 bg-[#009900] text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}