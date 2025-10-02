import { Briefcase, MapPin, GraduationCap, Users, Calendar, Award } from 'lucide-react';

function Profile() {
  const profileData = {
    name: 'Sarah Johnson',
    title: 'Product Manager',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    education: 'Stanford University, MBA',
    initials: 'SJ',
    about: "Passionate product manager with 7+ years of experience building user-centric products. I love connecting with fellow PMs, designers, and entrepreneurs to share insights and learn from each other.",
    interests: ['Product Management', 'Design', 'Technology', 'Startup', 'Leadership'],
    skills: ['Product Strategy', 'User Research', 'Data Analysis', 'Agile', 'Leadership'],
    stats: {
      connections: 234,
      memberSince: 'Mar 2023',
      experience: '7 years'
    },
    achievements: [
      {
        title: 'Top Performer 2024',
        company: 'TechCorp',
        icon: '🏆'
      },
      {
        title: 'Product Launch Excellence',
        company: 'TechCorp',
        icon: '🏆'
      },
      {
        title: 'Leadership Recognition',
        company: 'Previous Company',
        icon: '🏆'
      }
    ],
    recentActivity: [
      {
        action: 'Attended Tech Leaders Breakfast',
        date: '9/14/2025'
      },
      {
        action: 'Connected with Alex Chen',
        date: '9/13/2025'
      },
      {
        action: 'Registered for Startup Pitch Night',
        date: '9/11/2025'
      }
    ],
    contactInfo: {
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      website: 'sarahjohnson.dev'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional profile</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {profileData.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profileData.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profileData.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{profileData.education}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{profileData.contactInfo.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">{profileData.contactInfo.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Website</p>
                  <p className="text-blue-600 font-medium">{profileData.contactInfo.website}</p>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Connections</p>
                    <p className="text-2xl font-bold text-gray-900">{profileData.stats.connections}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Member since</p>
                    <p className="text-2xl font-bold text-gray-900">{profileData.stats.memberSince}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Experience</p>
                    <p className="text-2xl font-bold text-gray-900">{profileData.stats.experience}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {profileData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
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