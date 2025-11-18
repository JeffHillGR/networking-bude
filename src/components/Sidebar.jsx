import { useState, useEffect } from 'react';
import { Home, Calendar, Users, MessageCircle, User, CreditCard, Archive, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

function Sidebar({ activeTab, setActiveTab, onContactUsClick }) {
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = useState(localStorage.getItem('userFirstName') || 'User');
  const [lastName, setLastName] = useState(localStorage.getItem('userLastName') || 'Name');
  const [jobTitle, setJobTitle] = useState(localStorage.getItem('userJobTitle') || 'Job Title');
  const fullName = `${firstName} ${lastName}`;
  const [photoUrl, setPhotoUrl] = useState(null);

  // Fetch user data from Supabase on mount
  useEffect(() => {
    async function fetchUserData() {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, title, photo')
            .eq('email', user.email.toLowerCase())
            .single();

          if (error) {
            console.log('Error fetching user data:', error);
            return;
          }

          if (data) {
            const userFirstName = data.first_name || 'User';
            const userLastName = data.last_name || 'Name';
            const userJobTitle = data.title || 'Job Title';

            // Update state
            setFirstName(userFirstName);
            setLastName(userLastName);
            setJobTitle(userJobTitle);
            setPhotoUrl(data.photo || null);

            // Update localStorage so it's available for other components
            localStorage.setItem('userFirstName', userFirstName);
            localStorage.setItem('userLastName', userLastName);
            localStorage.setItem('userJobTitle', userJobTitle);
          }
        } catch (err) {
          console.error('Error in fetchUserData:', err);
        }
      }
    }
    fetchUserData();
  }, [user]);

  const [showActivity, setShowActivity] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'connections', icon: Users, label: 'Connections' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'settings', icon: User, label: 'Profile' }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 flex-shrink-0 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed left-0 w-64 h-screen bg-cover opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
          backgroundPosition: 'center 15%',
          backgroundSize: 'cover',
          transform: 'scale(1.1)',
          top: '90px'
        }}
      />
      {/* Content Layer */}
      <div className="flex flex-col h-screen relative z-10">
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Logo */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png"
                alt="BudE Logo"
                className="w-full h-auto"
              />
            </button>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === item.id
                     ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}

              {/* Account Section */}
              <div className="border-t border-gray-200 my-3 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">ACCOUNT</p>

                {/* My Activity */}
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-500 hover:bg-gray-100"
                >
                  <Activity className="w-4 h-4" />
                  <span className="flex-1 text-left text-xs">My Activity</span>
                  <span className="text-xs">{showActivity ? '▼' : '▶'}</span>
                </button>

                {showActivity && (
                  <div className="ml-4 mt-1 space-y-1 px-3 py-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Profile Views</span>
                      <span className="font-bold text-gray-900">342</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Upcoming Events</span>
                      <span className="font-bold text-gray-900">8</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('payment')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-gray-500 hover:bg-gray-100"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Account</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Fixed user profile section at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-100 rounded-lg">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-8 h-8 rounded-full object-cover border-2 border-black"
              />
            ) : (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-[#009900] font-bold text-xs">
                  {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">{fullName}</p>
              <p className="text-xs text-gray-600 truncate">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-900 mb-2">
           <button onClick={() => setActiveTab('terms')} className="hover:underline">Terms</button>
             <span>•</span>
           <button onClick={() => setActiveTab('privacy')} className="hover:underline">Privacy</button>
             <span>•</span>
           <button onClick={onContactUsClick} className="hover:underline">Contact Us</button>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = '/';
            }}
            className="w-full py-2 text-xs text-[#009900] font-bold hover:bg-gray-50 rounded transition-colors mb-1"
          >
            Logout
          </button>
          <p className="text-xs text-gray-900 text-center">© 2025 The BudE System™</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;