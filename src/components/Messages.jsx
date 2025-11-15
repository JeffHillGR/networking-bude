import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Messages({ onBackToDashboard }) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations from database
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // Get all conversations for this user
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // For each conversation, get the other user's profile
        const conversationsWithProfiles = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

            // Get other user's profile from users table
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('name, title, company, photo')
              .eq('id', otherUserId)
              .single();

            if (profileError) {
              console.error('Error fetching user profile:', profileError);
              console.error('Attempted to fetch user ID:', otherUserId);
              console.error('Error details:', JSON.stringify(profileError, null, 2));
            }

            // Calculate unread count for current user
            const unreadCount = conv.user1_id === user.id
              ? conv.user1_unread_count
              : conv.user2_unread_count;

            // Get initials from name
            const getInitials = (name) => {
              if (!name) return 'U';
              const parts = name.split(' ');
              if (parts.length >= 2) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
              }
              return name.substring(0, 2).toUpperCase();
            };

            return {
              id: conv.id,
              otherUserId,
              name: profileData?.name || 'Unknown User',
              title: profileData?.title && profileData?.company
                ? `${profileData.title} at ${profileData.company}`
                : profileData?.title || profileData?.company || '',
              photo: profileData?.photo,
              lastMessage: conv.last_message || 'No messages yet',
              timestamp: formatTimestamp(conv.last_message_at || conv.created_at),
              unread: unreadCount > 0,
              unreadCount,
              initials: getInitials(profileData?.name),
              updatedAt: conv.updated_at
            };
          })
        );

        setConversations(conversationsWithProfiles);
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setLoading(false);
      }
    };

    loadConversations();

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${user.id}`
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${user.id}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const loadMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(messagesData || []);
        scrollToBottom();

        // Mark messages as read
        await markMessagesAsRead();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();

          // Mark as read if we're the recipient
          if (payload.new.recipient_id === user.id) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversation, user]);

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return;

    try {
      // Mark all unread messages in this conversation as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation.id)
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Reset unread count in conversation
      const isUser1 = selectedConversation.otherUserId > user.id;
      const updateField = isUser1 ? 'user1_unread_count' : 'user2_unread_count';

      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', selectedConversation.id);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, unread: false, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user || sending) return;

    setSending(true);
    const messageContent = messageInput.trim();
    setMessageInput('');

    try {
      console.log('Attempting to send message with data:', {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        recipient_id: selectedConversation.otherUserId,
        content: messageContent
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          recipient_id: selectedConversation.otherUserId,
          content: messageContent
        })
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Message sent successfully:', data);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message || 'Please try again.'}`);
      setMessageInput(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Handle report user submission
  const handleReportUser = async () => {
    if (!reportReason.trim() || !selectedConversation || !user || reportSubmitting) return;

    setReportSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: selectedConversation.otherUserId,
          reason: reportReason.trim()
        });

      if (error) throw error;

      alert('Report submitted successfully. Thank you for helping keep our community safe.');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`Failed to submit report: ${error.message || 'Please try again.'}`);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Filter messages based on search
  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Highlight search terms
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

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 flex-shrink-0">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 relative ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Conversations</h2>
              {totalUnreadCount > 0 && (
                <span className="text-sm text-gray-500">{totalUnreadCount} unread</span>
              )}
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
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-2">No conversations yet</p>
                <p className="text-sm">Connect with other members to start chatting!</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowMobileChat(true);
                  }}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.photo ? (
                      <img
                        src={conv.photo}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {conv.initials}
                      </div>
                    )}
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
                    {conv.title && (
                      <p className="text-xs text-gray-600 mb-1 truncate">{conv.title}</p>
                    )}
                    <p className={`text-sm truncate ${conv.unread ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className={`flex-1 flex flex-col bg-white relative ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              {/* Mobile back button */}
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedConversation.photo ? (
                    <img
                      src={selectedConversation.photo}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedConversation.initials}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedConversation.name}</h2>
                  {selectedConversation.title && (
                    <p className="text-sm text-gray-600">{selectedConversation.title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showOptionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowOptionsMenu(false)}
                    />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
                            // TODO: Implement delete conversation
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
                          setShowReportModal(true);
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
                {filteredMessages.length === 0 && !searchQuery ? (
                  <div className="text-center text-sm text-gray-500 mb-8">
                    This is the beginning of your conversation with {selectedConversation.name}
                  </div>
                ) : filteredMessages.length === 0 && searchQuery ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="relative group max-w-md">
                        <div
                          className={`px-4 py-3 rounded-lg ${
                            message.sender_id === user.id
                              ? 'bg-green-100 text-gray-900'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{highlightText(message.content, searchQuery)}</p>
                          <p className="text-xs mt-1 text-gray-600">
                            {formatTimestamp(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="max-w-3xl mx-auto flex items-end gap-3">
                <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-lg px-4 py-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows="1"
                    className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500"
                    disabled={sending}
                  />
                  <button className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="p-3 bg-[#009900] hover:bg-[#007700] rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Select a conversation to start messaging</p>
              <p className="text-sm">Choose from your connections on the left</p>
            </div>
          </div>
        )}
      </div>

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Report User</h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please describe why you're reporting {selectedConversation?.name}. This helps us maintain a safe community.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
              placeholder="Describe the issue..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportUser}
                disabled={!reportReason.trim() || reportSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
