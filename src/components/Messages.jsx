import { useState } from 'react';
import { Search, MoreVertical, Smile, Send, ArrowLeft } from 'lucide-react';

function Messages({ onBackToDashboard }) {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [pinnedConversations, setPinnedConversations] = useState([]);

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

  const reactions = [
    { emoji: '👍', label: 'Thumbs up' },
    { emoji: '❤️', label: 'Heart' },
    { emoji: '💡', label: 'Insightful' },
    { emoji: '‼️', label: 'Important' }
  ];

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

  const handleReaction = (messageId, emoji) => {
    setMessageReactions(prev => {
      const current = prev[messageId] || {};
      const hasReaction = current[emoji];

      if (hasReaction) {
        // Remove reaction
        const { [emoji]: _, ...rest } = current;
        return { ...prev, [messageId]: rest };
      } else {
        // Add reaction
        return { ...prev, [messageId]: { ...current, [emoji]: true } };
      }
    });
    setShowReactions(null);
  };

  const togglePin = (conversationId) => {
    setPinnedConversations(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      } else {
        return [...prev, conversationId];
      }
    });
    setShowOptionsMenu(false);
  };

  const isPinned = pinnedConversations.includes(selectedChat);

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Helper function to highlight search terms in text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
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
          <p className="text-gray-600 mt-2">Connect and chat with your BudE connections</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Scientist Overlay */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-start justify-center pt-12">
          <div className="text-center max-w-4xl px-6">
            <img
              src="/scientist-chalkboard.jpg"
              alt="Coming Soon"
              className="w-full mx-auto mb-6 object-contain"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Coming Soon!</h2>
            <p className="text-lg text-gray-600">
              Our scientists are hard at work building the messaging system. We'll use email for now
            </p>
          </div>
        </div>

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
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {conv.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.name}</h3>
                    </div>
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
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{currentChat?.name}</h2>
                <p className="text-sm text-gray-600">{currentChat?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Options Dropdown Menu */}
              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptionsMenu(false)}
                  />
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => togglePin(selectedChat)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        isPinned
                          ? 'bg-green-50 text-green-700 font-medium hover:bg-green-100'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📌 Pin Conversation
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
                          console.log('Delete conversation');
                          setShowOptionsMenu(false);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🗑️ Delete Conversation
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        console.log('Report user');
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ⚠️ Report User
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="text-center text-sm text-gray-500 mb-8">
                This is the beginning of your conversation with {currentChat?.name}
              </div>

              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="relative group">
                    <div
                      className={`max-w-md px-4 py-3 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-green-100 text-gray-900'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{highlightText(message.text, searchQuery)}</p>
                      <p className="text-xs mt-1 text-gray-600">
                        {message.timestamp}
                      </p>
                    </div>

                    {/* Reaction button - shows on hover */}
                    <button
                      onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-50"
                      title="React to message"
                    >
                      <Smile className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Reactions picker */}
                    {showReactions === message.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowReactions(null)}
                        />
                        <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-1 flex gap-1 z-20">
                          {reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className="text-xl hover:scale-125 transition-transform p-1"
                              title={reaction.label}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Display reactions */}
                    {messageReactions[message.id] && Object.keys(messageReactions[message.id]).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.keys(messageReactions[message.id]).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className="bg-white border border-gray-300 rounded-full px-2 py-0.5 text-sm hover:bg-gray-50 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {searchQuery && filteredMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No messages found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-3">
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
        </div>
      </div>
    </div>
  );
}

export default Messages;