import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
// Matching algorithm now runs server-side via Edge Function

export default function BudEOnboarding() {
  const navigate = useNavigate();
  const { signUp, signIn, resetPassword, user } = useAuth();
  const [step, setStep] = useState(0);
  const [showLandingHero, setShowLandingHero] = useState(true); // NEW: Show full-screen hero first
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  // Carousel state for hero images
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

  const desktopBanners = [
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Banner-1.png',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Banner-2.png',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Banner-3.png',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Banner-4.png',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Banner-5.png'
  ];

  const mobileBanners = [
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Mobile-1.png?t=20251119',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Mobile-2.png?t=20251119',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Mobile-3.png?t=20251119',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Mobile-4.png?t=20251120',
    'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Landing-Page-Mobile-5.png'
  ];

  // Preload banner images
  useEffect(() => {
    [...desktopBanners, ...mobileBanners].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-rotate carousel every 8 seconds (pause on hover)
  useEffect(() => {
    if (!showLandingHero || isHovering) return;

    const timer = setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % 5); // Cycle 0 -> 1 -> 2 -> 3 -> 4 -> 0
    }, 8000);

    return () => clearInterval(timer);
  }, [showLandingHero, isHovering]);

  // Change to image 2 when user starts scrolling
  useEffect(() => {
    if (!showLandingHero) return;

    const handleScroll = () => {
      if (heroImageIndex === 0 && window.scrollY > 10) {
        setHeroImageIndex(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showLandingHero, heroImageIndex]);

  // TODO: Re-enable after adding login functionality
  // Redirect already logged-in users to dashboard (but not during signup process)
  // React.useEffect(() => {
  //   if (user && !justSignedUp && step === 0) {
  //     navigate('/dashboard');
  //   }
  // }, [user, justSignedUp, step, navigate]);

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
  const [showPrivacyTerms, setShowPrivacyTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    company: '',
    industry: '',
    sameIndustry: '',
    gender: '',
    genderPreference: '',
    yearBorn: '',
    yearBornConnect: '',
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
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo GR',
    'Hello West Michigan', 'CARWM', 'Creative Mornings GR', 'Athena',
    'Inforum', 'Start Garden', 'GRABB', 'WMPRSA', 'Crain\'s GR Business', 'AIGA - WM',
    'West Michigan Hispanic Chamber of Commerce'
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password');
      return;
    }

    const { data, error } = await signIn(loginEmail, loginPassword);

    if (error) {
      setLoginError(error.message || 'Invalid email or password');
      return;
    }

    if (data?.user) {
      // Successfully logged in, navigate to dashboard
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!resetEmail || !isValidEmail(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    const { error } = await resetPassword(resetEmail);

    if (error) {
      setResetError(error.message || 'Failed to send reset email');
      return;
    }

    setResetSuccess(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSubmitting(true);

    if (!contactName || !contactEmail || !contactMessage) {
      setContactError('Please fill in all fields');
      setContactSubmitting(false);
      return;
    }

    if (!isValidEmail(contactEmail)) {
      setContactError('Please enter a valid email address');
      setContactSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/submitContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      console.error('Contact form error:', error);
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
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
      // Create Supabase auth user and profile
      console.log('📤 Creating Supabase user...');

      const { data, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        title: formData.jobTitle,
        company: formData.company,
        industry: formData.industry,
        zip_code: formData.zipCode,
        location: formData.zipCode,
        year_born: formData.yearBorn ? parseInt(formData.yearBorn, 10) : null,
        year_born_connect: formData.yearBornConnect,
        gender: formData.gender,
        gender_preference: formData.genderPreference,
        same_industry_preference: formData.sameIndustry,
        organizations_current: formData.organizations,
        organizations_other: formData.organizationsOther,
        organizations_interested: formData.organizationsToCheckOut,
        organizations_to_check_out_other: formData.organizationsToCheckOutOther,
        professional_interests: formData.professionalInterests,
        professional_interests_other: formData.professionalInterestsOther,
        personal_interests: formData.personalInterests || '',
        networking_goals: formData.networkingGoals,
        connection_count: 0,
        max_connections: 10
      });

      if (error) throw error;

      console.log('✅ User created in Supabase');

      // Mark that we just signed up (prevents immediate redirect)
      setJustSignedUp(true);

      // Show success popup
      setShowSuccessPopup(true);

      // Trigger matching algorithm for the new user (don't wait for it)
      // Call server-side Edge Function which has permission to create matches
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-matching-algorithm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
        console.log('✅ Matching algorithm completed:', data);
      }).catch(err => {
        console.error('⚠️ Matching algorithm failed (non-critical):', err);
      });

      // Navigate to dashboard after 4 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create account. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const BudELogo = () => (
  <img
  src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png"
  alt="BudE Logo"
  className="h-16.5 w-auto"
/>
  );

  // NEW: Full-screen landing page with hero images
  const renderLandingPage = () => (
    <div className="min-h-screen w-full bg-white overflow-y-auto">
      {/* Top bar - Lime-Green-Lime gradient with "Already a member?" */}
      <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] px-4 py-2 text-center sticky top-0 z-20 relative">
        <button
          onClick={() => setShowLoginModal(true)}
          className="bg-[#009900] text-white font-medium text-sm md:text-base px-6 py-1.5 rounded-full border-2 border-white hover:bg-[#007700] transition-colors"
        >
          Already a Member?
        </button>
      </div>

      {/* Hero section - takes up full viewport */}
      <div className="h-screen flex flex-col">
        {/* Hero image carousel with fade transitions */}
        <div
          ref={carouselRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="flex-1 relative overflow-hidden"
        >
          {/* Image container with stacked images for fade effect */}
          <div className="absolute inset-0 w-full h-full">
            {/* Mobile banners */}
            {mobileBanners.map((img, index) => (
              <img
                key={`mobile-${index}`}
                src={img}
                alt={`Networking BudE ${index + 1}`}
                className={`md:hidden absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  index === heroImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            {/* Desktop banners */}
            {desktopBanners.map((img, index) => (
              <img
                key={`desktop-${index}`}
                src={img}
                alt={`Networking BudE ${index + 1}`}
                className={`hidden md:block absolute inset-0 w-full h-full object-fill transition-opacity duration-700 ease-in-out ${
                  index === heroImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {/* Text Overlay for Banner 1 */}
            {heroImageIndex === 0 && (
              <div className="absolute inset-0 flex items-start pt-72 md:pt-56 lg:pt-72 px-8 md:px-16 lg:px-24">
                <div className="text-left bg-white/40 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-lg" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    Traditional networking scene
                  </h1>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    not working for you?
                  </h1>
                </div>
              </div>
            )}

            {/* Text Overlay for Banner 2 */}
            {heroImageIndex === 1 && (
              <div className="absolute inset-0 flex items-start pt-72 md:pt-56 lg:pt-72 px-8 md:px-16 lg:px-24">
                <div className="text-left bg-white/40 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-lg" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    Resulting in a drawer
                  </h1>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    full of lonely business cards?
                  </h1>
                </div>
              </div>
            )}

            {/* Text Overlay for Banner 3 */}
            {heroImageIndex === 2 && (
              <div className="absolute inset-0 flex items-start pt-72 md:pt-56 lg:pt-72 px-8 md:px-16 lg:px-24">
                <div className="text-left bg-white/40 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-lg" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    Making more "connections"
                  </h1>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    giving you the blues?
                  </h1>
                </div>
              </div>
            )}

            {/* Text Overlay for Banner 4 */}
            {heroImageIndex === 3 && (
              <div className="absolute inset-0 flex items-start pt-72 md:pt-56 lg:pt-72 px-8 md:px-16 lg:px-24">
                <div className="text-left bg-white/40 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-lg" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    We think we may have
                  </h1>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    the solution for you
                  </h1>
                </div>
              </div>
            )}

            {/* Text Overlay for Banner 5 */}
            {heroImageIndex === 4 && (
              <div className="absolute inset-0 flex items-start pt-72 md:pt-56 lg:pt-72 px-8 md:px-16 lg:px-24">
                <div className="text-left bg-white/40 backdrop-blur-sm px-3 py-2 md:px-6 md:py-4 rounded-lg" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    Just 3 easy steps to start
                  </h1>
                  <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    making more meaningful connections
                  </h1>
                </div>
              </div>
            )}

            {/* Navigation arrows - bottom corners */}
            <button
              onClick={() => setHeroImageIndex((prev) => (prev === 0 ? 4 : prev - 1))}
              className="absolute bottom-[18%] left-[2%] z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setHeroImageIndex((prev) => (prev === 4 ? 0 : prev + 1))}
              className="absolute bottom-[18%] right-[2%] z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Join Now button - centered at bottom (desktop only) */}
            <div className="hidden md:flex absolute bottom-16 left-0 right-0 z-10 justify-center">
              <button
                onClick={() => setShowLandingHero(false)}
                className="bg-gray-200 text-[#009900] font-bold text-lg px-10 py-3 rounded-full hover:bg-gray-300 transition-colors border-2 border-[#D0ED00] shadow-xl"
              >
                Check It Out
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar - Mobile only */}
        <div className="md:hidden bg-white px-4 py-4 flex-shrink-0">
          <div className="flex justify-center">
            <button
              onClick={() => setShowLandingHero(false)}
              className="bg-gray-200 text-[#009900] font-bold text-lg px-10 py-3 rounded-full hover:bg-gray-300 transition-colors border-2 border-[#D0ED00]"
            >
              Check It Out
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 px-6 py-12" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div className="max-w-3xl mx-auto">
          {/* About Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">About</h2>
          </div>

          <div className="text-gray-700 space-y-6 leading-relaxed text-lg">
            <p className="font-semibold">
              Welcome to Networking BudE by The BudE System™
            </p>

            <p>
              For years I kept hearing, "traditional networking isn't working." Honestly, I felt that too, especially walking into those giant 800-person breakfasts in downtown Grand Rapids. I'd show up in my rarely-used dress clothes, already anxious, already wondering who to interrupt, who to avoid, and whether I'd make even one meaningful connection. Usually the answer was… nope. Just another business card in the drawer.
            </p>

            <p>
              I've been doing professional networking for 25+ years, building community, growing my business, switching jobs, learning new things. But post-Covid, the old way felt even more awkward. Lots of small talk, not much substance.
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-center my-8">
              <div className="md:w-1/2 text-left">
                <p className="text-4xl md:text-5xl font-bold text-gray-600 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  A networking wingperson for every event.
                  <br /><br />
              
                </p>
              </div>
              <div className="md:w-1/2">
                <p className="font-semibold">
                  Everything shifted when I stopped going alone.
                </p>

                <p className="mt-6">
                  When I started inviting friends and colleagues to events, the whole experience changed. Suddenly networking became strategic and fun. We introduced each other to collaborators and clients. We worked the room together. We made real connections, the kind that turned into coffees, lunches, and new opportunities. My networking buddies had the same results.
                </p>
              </div>
            </div>

            <p>
              Now I have a small crew of 6–7 great people I go to events with, not thousands of passive connections, but a handful of intentional, community-focused pros who help each other grow. It's been game-changing.
            </p>

            <p>
              Maybe you already have this. Maybe you don't. That's why I created The BudE System to help you build the same kind of meaningful, wingperson-powered networking I've been lucky enough to experience.
            </p>

            <p>
              I hope you find real connections here. Check out the events and insights, and make the most of them.
            </p>

            <p className="font-semibold">
              Have a meaningful week.
            </p>

            <div className="mt-8 text-gray-900">
              <p className="font-semibold">Jeff Hill</p>
              <p>Founder, The BudE System™</p>
              <p>Grand Rapids, Michigan</p>
            </div>
          </div>
        </div>
      </div>

      {/* People Networking Images - Side by Side */}
      <div className="bg-gray-50 flex justify-center pb-8 px-4 md:px-6">
        <div className="flex gap-4 md:gap-12 max-w-[820px] w-full items-center">
          <img
            src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-1.png"
            alt="People Networking"
            className="w-1/2 object-contain"
          />
          <img
            src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-3.png"
            alt="People Networking"
            className="w-[45%] object-contain"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white px-6 py-12" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div className="max-w-3xl mx-auto">
          {/* How It Works Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">How It Works</h2>
          </div>

          <div className="text-gray-700 space-y-6 leading-relaxed text-lg">
            <div>
              <p className="font-bold mb-2">You create your profile</p>
              <p>
                Tell us your professional interests, the organizations you're part of (or want to explore), your hobbies, and most importantly your networking goals.
              </p>
            </div>

            {/* Mobile: Hook appears first */}
            <div className="md:hidden mb-8">
              <div className="text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                <p className="text-3xl font-bold text-gray-600 leading-tight mb-3">
                  Those 3 easy steps
                </p>
                <p className="text-2xl font-bold text-gray-600 leading-relaxed">
                  Create your profile<br/>
                  Start connecting<br/>
                  Go to events together
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center my-8">
              <div className="md:w-1/2">
                <p className="font-bold mb-2">We take the wheel</p>
                <ul className="space-y-2">
                  <li>We suggest compatible connections.</li>
                  <li>We show you weekly events worth checking out (and yes, you'll be surprised how much more effective they are with a BudE).</li>
                  <li>We tell you who in your selected network is interested in each event and who's actually going!</li>
                  <li>We give you Resources and Insights to elevate your networking game and support your professional growth.</li>
                </ul>
              </div>
              {/* Desktop: Hook on right */}
              <div className="hidden md:block md:w-1/2 text-right">
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  <p className="text-4xl md:text-5xl font-bold text-gray-600 leading-tight mb-4">
                    Those 3 easy steps
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-600 leading-relaxed">
                    Create your profile<br/>
                    Start connecting<br/>
                    Go to events together
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold mb-2">All in one app.</p>
              <p>
                That's The BudE System.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Athena Image */}
      <div className="bg-white flex justify-center pb-8">
        <img
          src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/Athena-2.jpg"
          alt="Athena"
          className="max-w-3xl w-full px-6"
        />
      </div>

      {/* How We Are Different Section */}
      <div className="bg-gray-50 px-6 py-12" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div className="max-w-3xl mx-auto">
          {/* How We Are Different Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">How We Are Different</h2>
          </div>

          <div className="text-gray-700 space-y-6 leading-relaxed text-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center my-8">
              {/* Desktop: Hook on left */}
              <div className="hidden md:block md:w-1/2 text-left">
                <p className="text-4xl md:text-5xl font-bold text-gray-600 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  You support their goals; they support yours.
                </p>
              </div>
              <div className="md:w-1/2">
                <p>
                  We suggest connections based on your goals and interests. Not on "who you know." What other social networking apps ask you that?
                </p>
                <p className="mt-4">
                  This isn't a numbers game. Strive for a great group of 5 - 7 connections.
                </p>
                <p className="mt-4">
                  We show you events and who in your group is going.
                </p>
                <p className="mt-4">
                  We make this a place where you can feel comfortable reaching out to build community.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: Hook appears at bottom */}
          <div className="md:hidden mt-8 mb-6">
            <p className="text-4xl font-bold text-gray-600 leading-tight text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              You support their goals; they support yours.
            </p>
          </div>

          {/* Join Now Button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowLandingHero(false)}
              className="bg-[#D0ED00] text-[#009900] font-bold text-lg px-10 py-3 rounded-full hover:bg-[#c4e000] transition-colors"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="bg-gray-100 px-6 py-6 text-center" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <button
          onClick={() => setShowContactModal(true)}
          className="text-[#009900] hover:text-[#007700] font-medium text-sm underline"
        >
          Contact Us
        </button>
        <p className="text-gray-600 text-sm mt-2">
          Copyright The BudE System™
        </p>
        <p className="text-gray-600 text-sm">
          Grand Rapids, Michigan
        </p>
      </div>
    </div>
  );


 const renderWelcome = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-6 md:gap-8">
      {/* Hook Statement - Left Side */}
      <div className="hidden md:flex md:w-1/2 items-center justify-end pr-4">
        <p className="text-4xl lg:text-5xl font-bold text-black leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          A networking wingperson for every event.
          <br /><br />
          In 3 easy steps
        </p>
      </div>

      {/* Form Section - Right Side */}
      <div className="w-full md:w-1/2 max-w-md">
        {/* BudE Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png"
            alt="BudE Logo"
            className="h-20 w-auto"
          />
        </div>

        {/* Main heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
          Let's set up your profile
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Find meaningful connections in your community
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div className="w-1/3 h-full bg-[#009900] rounded-full"></div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009900] focus:border-transparent"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-900">Password <span className="text-red-500">*</span></label>
              <button
                type="button"
                onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                className="flex items-center gap-1 text-xs text-[#009900] hover:text-[#007700] font-medium"
              >
                <span>Requirements</span>
                {showPasswordRequirements ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009900] focus:border-transparent"
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
                <p className="font-semibold text-gray-900 mb-1">Create a strong password</p>
                <p className="text-gray-700 mb-1">At least 12 characters with:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-700 ml-1">
                  <li>Uppercase letter (A–Z)</li>
                  <li>Lowercase letter (a–z)</li>
                  <li>Number (0–9)</li>
                  <li>Special character (!, @, #, etc.)</li>
                </ul>
              </div>
            )}
          </div>
        </div>

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
          className="w-full mt-6 bg-[#009900] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#007700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#D0ED00]"
        >
          Continue
        </button>
      </div>

        {/* Already have account link */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-[#009900] hover:text-[#007700] font-semibold"
          >
            Already have an account? Login
          </button>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Networking BudE by The BudE System™
        </p>
      </div>
    </div>
  </div>
);



  const renderStep1 = () => (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      {/* Green Header Bar - Spans Full Width */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-sm md:text-base z-20">
        <div className="md:ml-64 text-center">
          <span className="font-medium">Let's Set Up Your Profile</span>
        </div>
      </div>

      {/* Dashboard Background */}
      <div className="absolute inset-0 flex pointer-events-none pt-8">
        {/* Sidebar - Clear and Not Blurred */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 relative overflow-hidden">
          {/* Background Image - Positioned exactly like Dashboard Sidebar */}
          <div
            className="absolute left-0 top-0 w-full h-full bg-cover opacity-30 pointer-events-none"
            style={{
              backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
              backgroundPosition: 'right top',
              backgroundSize: 'cover',
              transform: 'scale(1.1)'
            }}
          />
          {/* Content Layer */}
          <div className="p-4 relative z-10">
            <img src="/BudE-Logo-Final.png" alt="BudE Logo" className="w-full h-auto mb-4" />
            <div className="space-y-4 flex flex-col items-center">
              <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-1.png" alt="People Networking" className="w-4/5 h-auto rounded-lg" />
              <div className="text-center px-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                <p className="text-lg font-bold text-black leading-tight mb-2">
                  Those 3 easy steps
                </p>
                <p className="text-base font-bold text-black leading-relaxed">
                  Create your profile<br/>
                  Start connecting<br/>
                  Go to events together
                </p>
              </div>
              <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-3.png" alt="People Networking" className="w-4/5 h-auto rounded-lg" />
            </div>
          </div>
        </div>

        {/* Main Content Area - Blurred Preview */}
        <div className="flex-1 bg-gray-50">

          <div className="filter blur-[2px] opacity-30">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 px-8 py-12">
              <div className="max-w-6xl mx-auto">
                <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>

            {/* Content cards */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
                <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
                <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Overlay - No Container Box */}
      <div className="absolute inset-0 md:left-64 flex items-start justify-center pt-12 pb-4 px-4 overflow-y-auto">
        <div className="w-full max-w-5xl">
          <div className="flex gap-2 mb-2 max-w-md mx-auto">
            <div className="flex-1 h-1.5 bg-black rounded-full"></div>
            <div className="flex-1 h-1.5 bg-black rounded-full"></div>
            <div className="flex-1 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Form Fields - Compact Layout */}
          <div className="space-y-2.5">
            {/* Row 1: Job Title, Company, Zip Code */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
                  <label className="block text-sm font-bold mb-1 text-gray-900">Company <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Zip Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Industry & Industry Connect */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Industry <span className="text-gray-500 font-normal">(optional)</span></label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
                  <label className="block text-sm font-bold mb-1 text-gray-900">Same Industry Connect</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.sameIndustry}
                    onChange={(e) => handleChange('sameIndustry', e.target.value)}
                  >
                    <option value="">Choose preference</option>
                    <option value="Yes">Yes, Same Industry</option>
                    <option value="No">No, Different Industry</option>
                    <option value="Either">Either</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Gender & Gender Connect */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Gender <span className="text-gray-500 font-normal">(optional)</span></label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
                  <label className="block text-sm font-bold mb-1 text-gray-900">Gender Preference Connect?</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
            </div>

            {/* Row 4: Year Born & Age Connect */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Year Born <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="YYYY"
                    maxLength={4}
                    value={formData.yearBorn}
                    onChange={(e) => handleChange('yearBorn', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-900">Age Connect?</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.yearBornConnect}
                    onChange={(e) => handleChange('yearBornConnect', e.target.value)}
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
            </div>

            {/* Row 5: Organizations - Side by Side */}
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900">Where You Can Find Me Networking Now</label>
                  <div className="flex flex-wrap gap-2">
                    {organizations.map(org => (
                      <button
                        key={org}
                        onClick={() => toggleOrganization(org)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.organizations.includes(org)
                            ? 'bg-[#009900] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Other organization"
                    className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.organizationsOther}
                    onChange={(e) => handleChange('organizationsOther', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-900">Organizations I've Wanted to Check Out</label>
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
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.organizationsToCheckOut?.includes(org)
                            ? 'bg-[#009900] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Other organization"
                    className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    value={formData.organizationsToCheckOutOther}
                    onChange={(e) => handleChange('organizationsToCheckOutOther', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 max-w-5xl">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-2 border border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => {
                setStep(2);
                window.scrollTo(0, 0);
              }}
              className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors text-sm"
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
  <div className="relative h-screen overflow-hidden bg-gray-50">
    {/* Green Header Bar - Spans Full Width */}
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-sm md:text-base z-20">
      <div className="md:ml-64 text-center">
        <span className="font-medium">Final Step! Please Tell Us About You</span>
      </div>
    </div>

    {/* Dashboard Background */}
    <div className="absolute inset-0 flex pointer-events-none pt-8">
      {/* Sidebar - Clear and Not Blurred */}
      <div className="hidden md:block w-64 bg-white border-r border-gray-200 relative overflow-hidden">
        {/* Background Image - Positioned exactly like Dashboard Sidebar */}
        <div
          className="absolute left-0 top-0 w-full h-full bg-cover opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
            backgroundPosition: 'right top',
            backgroundSize: 'cover',
            transform: 'scale(1.1)'
          }}
        />
        {/* Content Layer */}
        <div className="p-4 relative z-10">
          <img src="/BudE-Logo-Final.png" alt="BudE Logo" className="w-full h-auto mb-4" />
          <div className="space-y-4 flex flex-col items-center">
            <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-1.png" alt="People Networking" className="w-4/5 h-auto rounded-lg" />
            <p className="text-xl font-bold text-black leading-tight px-2 text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              You support their goals; they support yours.
            </p>
            <img src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/People-networking-3.png" alt="People Networking" className="w-4/5 h-auto rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Content Area - Blurred Preview */}
      <div className="flex-1 bg-gray-50">

        <div className="filter blur-[2px] opacity-30">
          {/* Hero Banner */}
          <div className="relative bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 px-8 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="h-10 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Content cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
              <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
              <div className="bg-white rounded-lg p-6 h-32 shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Form Overlay - No Container Box */}
    <div className="absolute inset-0 md:left-64 flex items-start justify-center pt-12 pb-4 px-4 overflow-y-auto">
      <div className="w-full max-w-5xl">
        <div className="flex gap-2 mb-2 max-w-md mx-auto">
          <div className="flex-1 h-1.5 bg-black rounded-full"></div>
          <div className="flex-1 h-1.5 bg-black rounded-full"></div>
          <div className="flex-1 h-1.5 bg-black rounded-full"></div>
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
            <h2 className="text-xl font-bold mb-1.5">Personal Interests <span className="text-red-500">*</span></h2>
            <p className="text-gray-600 mb-2 text-sm">
              What keeps you busy in your spare time? This helps create more meaningful connections beyond just professional interests.
            </p>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24 text-sm"
              placeholder="Tell us about your personal interests..."
              value={formData.personalInterests}
              onChange={(e) => handleChange('personalInterests', e.target.value)}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-2">{formData.personalInterests.length}/500 characters</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Networking Goals <span className="text-red-500">*</span></h2>
            <textarea
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24 text-sm"
              placeholder="• What frustrates you most about traditional networking?&#10;• In a perfect world what would networking look like to you?&#10;• The more descriptive the better."
              value={formData.networkingGoals}
              onChange={(e) => handleChange('networkingGoals', e.target.value)}
              maxLength={500}
              required
            />
            <p className="text-sm text-gray-500 mt-2">{formData.networkingGoals.length}/500 characters</p>
          </div>
        </div>

        <div className="flex justify-between mt-4 max-w-5xl">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (!formData.personalInterests || formData.personalInterests.trim() === '') {
                alert('Please fill in your Personal Interests before submitting');
              } else if (!formData.networkingGoals || formData.networkingGoals.trim() === '') {
                alert('Please fill in your Networking Goals before submitting');
              } else {
                handleFinalSubmit();
              }
            }}
            disabled={isSubmitting}
            className="bg-[#009900] text-white px-6 py-2 rounded-md border-[3px] border-[#D0ED00] font-semibold hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create My Account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          By creating an account, you agree to our{' '}
          <button
            onClick={() => setShowPrivacyTerms(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            Privacy Policy
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
      {showLandingHero ? renderLandingPage() : steps[step]()}

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

      {/* Privacy Terms Modal */}
      {showPrivacyTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Your Privacy Matters
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>We're committed to protecting your information. Your data is:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Stored securely in our database</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Never sold or shared with third parties</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Used only to improve your networking experience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <p>Can be deleted at your request at any time</p>
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
                onClick={() => setShowPrivacyTerms(false)}
                className="w-full mt-6 bg-[#009900] text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Login to BudE</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginEmail('');
                    setLoginPassword('');
                    setLoginError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                >
                  Login
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowForgotPasswordModal(true);
                    setResetEmail(loginEmail); // Pre-fill with login email if available
                  }}
                  className="text-sm text-[#009900] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
            <p className="text-gray-600 text-center mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {!resetSuccess ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{resetError}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setResetEmail('');
                      setResetError('');
                      setResetSuccess(false);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    ✓ Password reset email sent! Check your inbox for instructions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetEmail('');
                    setResetError('');
                    setResetSuccess(false);
                    setShowLoginModal(true); // Go back to login
                  }}
                  className="w-full px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Contact Us</h2>

            {!contactSuccess ? (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-y"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                {contactError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{contactError}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                      setContactError('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] disabled:opacity-50"
                  >
                    {contactSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    ✓ Message sent! We'll get back to you soon.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSuccess(false);
                  }}
                  className="w-full px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}