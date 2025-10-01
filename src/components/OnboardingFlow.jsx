import React, { useState } from 'react';
import { User, MapPin } from 'lucide-react';

export default function BudEOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    industry: '',
    sameIndustry: '',
    gender: '',
    genderPreference: '',
    dob: '',
    dobPreference: '',
    zipCode: '',
    radius: '',
    organizations: [],
    organizationsToCheckOut: [],
    professionalInterests: [],
    personalInterests: ''
  });

  const organizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economics Club', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'GRAR', 'CARWM', 'Creative Mornings'
  ];

  const professionalInterestOptions = [
    'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR',
    'Product Management', 'Data Science', 'Engineering', 'Consulting',
    'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media',
    'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const BudELogo = () => (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl px-8 py-3 inline-flex items-center justify-center">
      <p className="text-gray-600 font-medium">BudE Logo Final</p>
    </div>
  );

  const renderWelcome = () => (
    <div className="min-h-screen flex">
      <div className="w-1/2 bg-gradient-to-br from-green-100 via-yellow-50 to-green-50 p-12 flex flex-col items-center justify-center gap-8">
        <div className="w-80 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-8 border-white">
          <div className="text-center p-6">
            <p className="text-gray-500 font-semibold mb-2">Large image:</p>
            <p className="text-gray-700 font-bold text-lg">Cell phone with BudE app displayed</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <p className="text-gray-600 font-medium text-sm text-center px-2">Networking Image 1</p>
          </div>
          <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <p className="text-gray-600 font-medium text-sm text-center px-2">Networking Image 2</p>
          </div>
          <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <p className="text-gray-600 font-medium text-sm text-center px-2">Networking Image 3</p>
          </div>
        </div>
      </div>
      
      <div className="w-1/2 p-12 flex items-center justify-center bg-white">
        <div className="max-w-lg w-full">
          <div className="flex justify-center mb-8">
            <BudELogo />
          </div>

          <h1 className="text-4xl font-bold text-center mb-8">Welcome to Networking BudE</h1>

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">What's this all about?</h2>
            <p className="text-gray-700 mb-6">
              Networking BudE offers the ability to connect with others and attend events with people who share your networking goals:
            </p>
            <blockquote className="border-l-4 border-green-600 pl-4 italic text-gray-600">
              "I no longer feel awkward at events alone anymore. Thanks BudE!" - Meghan a Satisfied BudE User
            </blockquote>
          </div>

          <h3 className="text-xl font-semibold text-center mb-6">Ready to jump in? Let's go!</h3>

          <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
            <div className="w-1/3 h-full bg-black rounded-full"></div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setStep(1)}
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

  const renderStep1 = () => (
    <div className="min-h-screen flex">
      <div className="w-1/2 bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 p-12 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 max-w-md">
          <div className="w-48 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <User className="w-20 h-20 text-green-600" />
          </div>
          <div className="w-48 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <MapPin className="w-20 h-20 text-yellow-500" />
          </div>
          <div className="w-48 h-48 bg-white rounded-2xl shadow-lg flex items-center justify-center col-span-2">
            <div className="text-center p-4">
              <p className="text-gray-600 font-medium">Connecting professionals with shared goals</p>
            </div>
          </div>
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
                  <option value="yes">Yes, same industry</option>
                  <option value="no">No, different industries</option>
                  <option value="either">Either is fine</option>
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
                  <option value="similar">Similar age (±5 years)</option>
                  <option value="younger">Younger connections</option>
                  <option value="older">Older connections</option>
                  <option value="any">Any age</option>
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
                  <option value="5">5 miles</option>
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100+ miles</option>
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
              onClick={() => setStep(2)}
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
    <div className="min-h-screen bg-white p-12 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="flex justify-center mb-6">
          <BudELogo />
        </div>

        <p className="text-center text-gray-600 mb-8">Step 3 of 3 • Creating Your Professional Profile</p>

        <div className="flex gap-4 mb-12">
          <div className="flex-1 h-2 bg-green-600 rounded-full"></div>
          <div className="flex-1 h-2 bg-green-600 rounded-full"></div>
          <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
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

        <div className="flex justify-between mt-12">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => alert('Setup Complete! Redirecting to dashboard...')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );

  const steps = [renderWelcome, renderStep1, renderStep2];
  
  return steps[step]();
}