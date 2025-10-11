import { Briefcase, MapPin, GraduationCap, Users, Calendar, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

function Profile() {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Get onboarding data from localStorage
    const storedData = localStorage.getItem('onboardingData');
    if (storedData) {
      const data = JSON.parse(storedData);

      // Transform onboarding data into profile format
      const profile = {
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
        title: data.jobTitle || 'Professional',
        company: data.company || 'N/A',
        location: data.zipCode ? `Zip Code: ${data.zipCode}` : 'Not specified',
        education: 'N/A',
        initials: `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase() || 'U',
        about: data.networkingGoals || data.personalInterests || 'No bio added yet.',
        interests: data.professionalInterests || [],
        skills: [],
        stats: {
          connections: 0,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          experience: 'New Member'
        },
        achievements: [],
        recentActivity: [
          {
            action: 'Created account',
            date: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
          }
        ],
        contactInfo: {
          email: data.email || 'Not provided',
          phone: 'Not provided',
          website: 'Not provided'
        },
        preferences: {
          industry: data.industry || 'Not specified',
          sameIndustry: data.sameIndustry || 'Not specified',
          gender: data.gender || 'Not specified',
          genderPreference: data.genderPreference || 'Not specified',
          dobPreference: data.dobPreference || 'Not specified'
        },
        organizations: data.organizations || [],
        organizationsToCheckOut: data.organizationsToCheckOut || []
      };

      setProfileData(profile);
    } else {
      // Fallback if no onboarding data exists
      setProfileData({
        name: 'User',
        title: 'Professional',
        company: 'N/A',
        location: 'Not specified',
        education: 'N/A',
        initials: 'U',
        about: 'Complete your onboarding to see your profile.',
        interests: [],
        skills: [],
        stats: {
          connections: 0,
          memberSince: 'New',
          experience: 'New Member'
        },
        achievements: [],
        recentActivity: [],
        contactInfo: {
          email: 'Not provided',
          phone: 'Not provided',
          website: 'Not provided'
        },
        preferences: {},
        organizations: [],
        organizationsToCheckOut: []
      });
    }
  }, []);

  if (!profileData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Loading profile...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">Manage your professional profile</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
                  {profileData.initials}
                </div>
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0 mb-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{profileData.name}</h2>
                      <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm md:text-base">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileData.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm md:text-base">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileData.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm md:text-base">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileData.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm md:text-base">
                        <GraduationCap className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileData.education}</span>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base whitespace-nowrap">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{profileData.about}</p>
              </div>

              {/* Professional Interests */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Professional Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills & Expertise */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Achievements</h3>
                <div className="space-y-4">
                  {profileData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="min-w-0">
                  <p className="text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium break-words">{profileData.contactInfo.email}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium break-words">{profileData.contactInfo.phone}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-600">Website</p>
                  <p className="text-blue-600 font-medium break-words">{profileData.contactInfo.website}</p>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Connections</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{profileData.stats.connections}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Member since</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{profileData.stats.memberSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">Experience</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{profileData.stats.experience}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base md:text-lg">Recent Activity</h3>
              <div className="space-y-3">
                {profileData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 break-words">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;