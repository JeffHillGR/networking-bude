import React, { useState } from 'react';
import { User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitToGoogleForms, isFormConfigured } from '../utils/googleForms';

export default function BudEOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    jobTitle: '',
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
    personalInterests: ''
  });

  const organizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'CARWM', 'Creative Mornings', 'Athena',
    'Inforum', 'Start Garden'
  ];

  const professionalInterestOptions = [
    'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR',
    'Product Management', 'Data Science', 'Engineering', 'Consulting',
    'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media',
    'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership'
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
      // Submit to Google Forms if configured
      if (isFormConfigured()) {
        await submitToGoogleForms(formData);
        console.log('Data sent to Google Forms');
      } else {
        console.warn('Google Forms not configured. Skipping submission.');
      }

      // Save to localStorage (existing behavior)
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('userFirstName', formData.firstName);
      localStorage.setItem('userLastName', formData.lastName);
      localStorage.setItem('userJobTitle', formData.jobTitle);
      localStorage.setItem('userIndustry', formData.industry);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during submission:', error);
      // Continue to dashboard even if Google Forms fails
      navigate('/dashboard');
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
  <div className="min-h-screen flex">
    {/* Left side - Images */}
    <div className="w-1/2 bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 p-12 flex items-start justify-end pt-16">
      <div className="relative">
        {/* Large phone image */}
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
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border-3 border-white">
             <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/People-networking-1.png" alt="Networking" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border-3 border-white">
             <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/People-networking-3.png" alt="Networking" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border-3 border-white">
              <img src="/People-networking-2.png" alt="Networking" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Right side - Form - keeping your existing form code */}
    <div className="w-1/2 p-8 flex items-center justify-center bg-white overflow-y-auto">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <BudELogo />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to Networking BudE</h1>
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-center">What's this all about?</h2>
          <p className="text-gray-700 mb-3 text-sm">
            Networking BudE offers the ability to connect with others and attend events with people who share your networking goals:
          </p>
          <blockquote className="border-l-4 border-green-600 pl-3 italic text-gray-600 text-sm">
            "I no longer feel awkward at events alone anymore. Thanks BudE!" - Meghan a Satisfied BudE User
          </blockquote>
        </div>

        <h3 className="text-base font-semibold text-center mb-4">Ready to jump in? Let's go!</h3>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div className="w-1/3 h-full bg-black rounded-full"></div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">First Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Last Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Preferred Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold">Password</label>
              <button
                type="button"
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <span>Password requirements</span>
                {showPasswordRequirements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <input
              type="password"
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
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

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setStep(1)}
            className="bg-black text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
          >
            Continue
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Already have an account? <a href="#" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  </div>
);



  const renderStep1 = () => (
    <div className="min-h-screen flex">
   <div className="w-1/2 relative p-12 flex items-start justify-end pt-16 overflow-hidden">
  <div className="absolute inset-0">
    <img 
      src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry.jpg"
      alt="Background"
      className="w-full h-full object-cover opacity-30"
    />
  </div>
  
  {/* Main image on top */}
  <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10">
    <img 
      src="/People-networking-1.png"
      alt="People networking"
      className="w-[500px] h-auto"
    />
  </div>
</div>

      <div className="w-1/2 p-12 flex items-center justify-center bg-white overflow-y-auto">
        <div className="max-w-lg w-full">
          <div className="flex justify-center mb-6">
            <BudELogo />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Networking BudE</h1>

          <div className="flex gap-2 mb-8">
            <div className="flex-1 h-2 bg-black rounded-full"></div>
            <div className="flex-1 h-2 bg-black rounded-full"></div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">Job Title or what are you known for?</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Marketing Director, Software Engineer, Entrepreneur"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Industry (optional)</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                >
                  <option value="">Select your industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="marketing">Marketing</option>
                  <option value="real estate">Real Estate</option>
                  <option value="law">Law</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="government">Government</option>
                  <option value="accounting">Accounting</option>
                  <option value="consulting">Consulting</option>
                  <option value="professional development">Professional Development</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="entrepreneur">Entrepreneur/Business Owner</option>
                  <option value="startup">Startup/Founder</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Same Industry Connect</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Gender (optional)</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <label className="block text-sm font-semibold mb-2">Gender Preference Connect?</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">DOB (optional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">DOB Connect?</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Zip Code
                </label>
                <input
                  type="text"
                  placeholder="Enter zip code"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Connecting Radius</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.radius}
                  onChange={(e) => handleChange('radius', e.target.value)}
                >
                  <option value="">How far to connect?</option>
                  <option value="25">Less than 25 Miles</option>
                  <option value="50">Less than 50 Miles</option>
                  <option value="100">Less than 100 Miles</option>
                  <option value="Same State">Same State</option>
                  <option value="No Preference">No Preference</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Organizations That Have Events I Like To Attend</label>
              <div className="flex flex-wrap gap-2">
                {organizations.map(org => (
                  <button
                    key={org}
                    onClick={() => toggleOrganization(org)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.organizations.includes(org)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Other organization (please specify)"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.organizationsOther}
                  onChange={(e) => handleChange('organizationsOther', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Organizations That I've Wanted to Check Out</label>
              <div className="flex flex-wrap gap-2">
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
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.organizationsToCheckOut?.includes(org)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Other organization (please specify)"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={formData.organizationsToCheckOutOther}
                  onChange={(e) => handleChange('organizationsToCheckOutOther', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
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

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <a href="#" className="text-blue-600 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );

const renderStep2 = () => (
  <div className="min-h-screen flex">
    {/* Left side - Image with blurred background */}
    <div className="w-1/2 relative p-12 flex items-start justify-end pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <img 
          src="/People-networking-2.png"
          alt="People networking"
          className="w-[500px] h-auto"
        />
      </div>
    </div>

    {/* Right side - Form */}
    <div className="w-1/2 p-12 flex items-center justify-center bg-white overflow-y-auto">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <BudELogo />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">Welcome to Networking BudE</h1>

        <div className="flex gap-2 mb-8">
          <div className="flex-1 h-2 bg-black rounded-full"></div>
          <div className="flex-1 h-2 bg-black rounded-full"></div>
          <div className="flex-1 h-2 bg-black rounded-full"></div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">Professional Interests</h2>
            <p className="text-gray-600 mb-4">Select the professional areas that interest you most</p>
            <div className="flex flex-wrap gap-3">
              {professionalInterestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleProfessionalInterest(interest)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    formData.professionalInterests.includes(interest)
                      ? 'bg-black text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Other professional interest (please specify)"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={formData.professionalInterestsOther}
                onChange={(e) => handleChange('professionalInterestsOther', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Personal Interests</h2>
            <p className="text-gray-600 mb-4">
              What keeps you busy in your spare time? Share your hobbies, activities, or passions outside of work.
              This helps create more meaningful connections beyond just professional interests.
            </p>
            <textarea
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-32"
              placeholder="Tell us about your personal interests..."
              value={formData.personalInterests}
              onChange={(e) => handleChange('personalInterests', e.target.value)}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-2">{formData.personalInterests.length}/500 characters</p>
          </div>
        </div>

        <div className="flex justify-between mt-8">
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
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
);

  const steps = [renderWelcome, renderStep1, renderStep2];
  
  return steps[step]();
}