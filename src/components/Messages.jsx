import { useState } from 'react';
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, ArrowLeft } from 'lucide-react';

function Messages({ onBackToDashboard }) {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah Thompson',
      title: 'UX Designer at Adobe',
      lastMessage: 'Looking forward to our coffee chat!',
      timestamp: '8d ago',
      unread: true,
      initials: 'ST',
      isOnline: true
    },
    {
      id: 2,
      name: 'Michael Brown',
      title: 'Data Scientist at Netflix',
      lastMessage: 'Thanks for the ML resources!',
      timestamp: '8d ago',
      unread: false,
      initials: 'MB',
      isOnline: false
    },
    {
      id: 3,
      name: 'Lisa Wang',
      title: 'Startup Founder',
      lastMessage: 'Would love to discuss your product stat...',
      timestamp: '8d ago',
      unread: false,
      initials: 'LW',
      isOnline: true
    },
    {
      id: 4,
      name: 'Alex Chen',
      title: 'Senior Engineer at Google',
      lastMessage: 'The tech conference was amazing! Did yo...',
      timestamp: '9d ago',
      unread: false,
      initials: 'AC',
      isOnline: false
    }
  ];

  const currentChat = conversations.find(c => c.id === selectedChat);

  const messages = [
    {
      id: 1,
      sender: 'them',
      text: 'Hi! I saw your profile and thought we might have some interesting things to discuss about product management.',
      timestamp: '2:30 PM'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Looking forward to our coffee chat!',
      timestamp: '8d ago'
    }
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 flex-shrink-0">
        {/* Back to Dashboard Button */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
            <h1 className="text-3xl font-bold text-black">Messages</h1>
          </div>
          <p className="text-gray-600 mt-2">Connect and chat with your professional network</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Conversations</h2>
              <span className="text-sm text-gray-500">2 unread</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009900] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {conv.initials}
                  </div>
                  {conv.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 truncate">{conv.title}</p>
                  <p className={`text-sm truncate ${conv.unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Beta Testing Blur Overlay for Conversations */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 md:p-8 mx-4 text-center shadow-2xl border-4 border-[#D0ED00] max-w-xs">
              <img
                src="/BudE-favicon.png"
                alt="BudE"
                className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 object-contain"
              />
              <p className="text-green-800 font-bold text-lg md:text-xl mb-2">
                Beta Version
              </p>
              <p className="text-green-700 font-medium text-sm md:text-base">
                Look for an email from us soon!
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentChat?.initials}
                </div>
                {currentChat?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{currentChat?.name}</h2>
                <p className="text-sm text-gray-600">{currentChat?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="text-center text-sm text-gray-500 mb-8">
                This is the beginning of your conversation with {currentChat?.name}
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'me'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-gray-900 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-lg px-4 py-3">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows="1"
                  className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500"
                />
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                className="p-3 bg-[#009900] hover:bg-[#007700] rounded-full transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Beta Testing Blur Overlay for Chat */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 md:p-8 mx-4 text-center shadow-2xl border-4 border-[#D0ED00] max-w-md">
              <img
                src="/BudE-favicon.png"
                alt="BudE"
                className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 object-contain"
              />
              <p className="text-green-800 font-bold text-lg md:text-xl mb-2">
                Beta Version
              </p>
              <p className="text-green-700 font-medium text-sm md:text-base">
                Look for an email from us soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;