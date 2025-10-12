import { useState } from 'react';
import { Home, Calendar, Heart, MessageCircle, User, Settings as SettingsIcon, CreditCard, Archive, Activity } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  // Get user data from localStorage
  const firstName = localStorage.getItem('userFirstName') || 'User';
  const lastName = localStorage.getItem('userLastName') || 'Name';
  const jobTitle = localStorage.getItem('userJobTitle') || 'Job Title';
  const fullName = `${firstName} ${lastName}`;

  const [showActivity, setShowActivity] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'connections', icon: Heart, label: 'Connections' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="flex flex-col h-screen">
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Logo */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full flex items-center justify-center px-3 py-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity rounded-lg hover:bg-gray-50"
            >
              <img
                src="/BudE-Logo-Final.png"
                alt="BudE Logo"
                className="h-16 w-auto"
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
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-gray-500 hover:bg-gray-100"
                >
                <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab('payment')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-gray-500 hover:bg-gray-100"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('archive')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-gray-500 hover:bg-gray-100"
                >
                  <Archive className="w-4 h-4" />
                  <span>Content Archive</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Fixed user profile section at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">{fullName}</p>
              <p className="text-xs text-gray-600 truncate">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
           <button onClick={() => setActiveTab('terms')} className="hover:underline">Terms</button>
             <span>•</span>
           <button onClick={() => setActiveTab('privacy')} className="hover:underline">Privacy</button>
             <span>•</span>
           <button onClick={() => setActiveTab('archive')} className="hover:underline">Archive</button>
          </div>
          <p className="text-xs text-gray-500 mt-1">© 2025 The BudE System™</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;