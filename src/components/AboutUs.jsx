import { ArrowLeft, Linkedin } from 'lucide-react';

function AboutUs({ onBackToDashboard, onContactUsClick }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBackToDashboard}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Narrative Section */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              The BudE System was born out of the frustration with traditional networking, as we've come to know it for more than 50 years in this country. The statistical improbability that you're going to make the right meaningful connections at traditional networking events. Going it alone is not going well for most people.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The premise and practice is that working within a "buddy system" (that's right, from grade school), finding a BudE (or a cohort of BudE's) and going to events together, that you can more successfully build the professional community you've been looking for. One that fosters collaboration, one that helps you build your business or your new idea, or that just gives you friends to experience educational events with.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We've all been taught since college or professional training to "go it alone." It's OK to not want to go it alone. And frankly it's just a lot more fun with BudE's.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              You no longer have to feel awkward alone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Hope you enjoy your experience here.
            </p>
          </div>

          {/* Team Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Jeff Hill */}
              <div className="text-center">
                <img
                  src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Jeff%20Hill%20LI.jpeg"
                  alt="Jeff Hill"
                  className="w-32 h-32 rounded-lg mx-auto mb-3 object-cover"
                />
                <div className="flex items-center justify-center gap-2 mb-1">
                  <a
                    href="https://www.linkedin.com/in/jeffahill/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                  >
                    Jeff Hill
                  </a>
                  <a
                    href="https://www.linkedin.com/in/jeffahill/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077B5] hover:text-[#005885]"
                    aria-label="Jeff Hill LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600">Founder</p>
              </div>

              {/* Stephen Clemenger */}
              <div className="text-center">
                <img
                  src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Stephen%20Clemenger.jpeg"
                  alt="Stephen Clemenger"
                  className="w-32 h-32 rounded-lg mx-auto mb-3 object-cover"
                />
                <div className="flex items-center justify-center gap-2 mb-1">
                  <a
                    href="https://www.linkedin.com/in/clemenger/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                  >
                    Stephen Clemenger
                  </a>
                  <a
                    href="https://www.linkedin.com/in/clemenger/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077B5] hover:text-[#005885]"
                    aria-label="Stephen Clemenger LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600">Technology Consultant</p>
              </div>

              {/* Tiffany Neuman */}
              <div className="text-center">
                <img
                  src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Tiffany%20Neuman.jpeg"
                  alt="Tiffany Neuman"
                  className="w-32 h-32 rounded-lg mx-auto mb-3 object-cover"
                />
                <div className="flex items-center justify-center gap-2 mb-1">
                  <a
                    href="https://www.linkedin.com/in/tiffanyneuman/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                  >
                    Tiffany Neuman
                  </a>
                  <a
                    href="https://www.linkedin.com/in/tiffanyneuman/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077B5] hover:text-[#005885]"
                    aria-label="Tiffany Neuman LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600">Branding/Legacy Consultant</p>
              </div>

              {/* Kristina Linder */}
              <div className="text-center">
                <img
                  src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Kristina%20Linder.jpeg"
                  alt="Kristina Linder"
                  className="w-32 h-32 rounded-lg mx-auto mb-3 object-cover"
                />
                <div className="flex items-center justify-center gap-2 mb-1">
                  <a
                    href="https://www.linkedin.com/in/kristinalinderccxp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-gray-700 hover:underline"
                  >
                    Kristina Linder
                  </a>
                  <a
                    href="https://www.linkedin.com/in/kristinalinderccxp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077B5] hover:text-[#005885]"
                    aria-label="Kristina Linder LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600">Director of BudE Experience</p>
              </div>
            </div>
          </div>

          {/* Contact Us Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Have Questions?</h3>
            <p className="text-gray-600 mb-4">We'd love to hear from you!</p>
            <button
              onClick={onContactUsClick}
              className="inline-flex items-center gap-2 bg-[#009900] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
