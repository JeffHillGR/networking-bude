import { useState } from 'react';

export const Onboarding = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleLinkedInImport = () => {
    console.log('LinkedIn import clicked');
    // Handle LinkedIn import
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Image and collage */}
      <div className="w-full md:w-1/2 bg-gray-100 p-8 flex items-center justify-center relative">
        <div className="relative w-full max-w-md">
          {/* Main phone image placeholder */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-8 shadow-2xl">
            <div className="bg-white rounded-2xl p-4 shadow-lg transform -rotate-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 flex items-center justify-center">
                <div className="text-white text-4xl font-bold">BudE</div>
              </div>
            </div>
          </div>
          
          {/* Small image collage on the right */}
          <div className="absolute right-0 top-12 space-y-4">
            <div className="w-32 h-32 bg-gray-300 rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300" />
            </div>
            <div className="w-32 h-32 bg-gray-300 rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300" />
            </div>
            <div className="w-32 h-32 bg-gray-300 rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl px-6 py-3 shadow-lg">
              <span className="text-white text-2xl font-bold">B BudE</span>
            </div>
          </div>

          {/* Welcome text */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Welcome to Networking BudE
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              What's this all about?
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Networking BudE offers the ability to connect with others and attend
              events with people who share your networking goals:
            </p>
            
            {/* Testimonial */}
            <div className="border-l-4 border-gray-300 pl-4 py-2 mb-6">
              <p className="text-gray-600 italic text-sm">
                "I no longer feel awkward at events alone anymore. Thanks BudE!" - Meghan a Satisfied BudE User
              </p>
            </div>

            <p className="text-center font-semibold text-gray-900 mb-6">
              Ready to jump in? Let's go!
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <div className="bg-black h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          {/* Quick Setup Box */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Quick Setup
            </h3>
            <p className="text-sm text-blue-700 text-center mb-4">
              Import your professional information from LinkedIn to get started faster
            </p>
            <button
              onClick={handleLinkedInImport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Import From LinkedIn
            </button>
            <p className="text-center text-sm text-blue-600 mt-3">
              Or fill out the form manually below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preferred Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg transition shadow-lg mt-6"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};