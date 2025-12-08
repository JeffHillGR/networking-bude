import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, X, ChevronLeft, ChevronRight, Share2, MessageCircle, Smile, Flag, Trash2, Send, Upload, Image } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function EventCaptures({ onBackToDashboard, embedded = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('captures');
  const [captures, setCaptures] = useState([]);
  const [archivedCaptures, setArchivedCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showPhotoRequestModal, setShowPhotoRequestModal] = useState(false);
  const [photoRequestSubmitted, setPhotoRequestSubmitted] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState('');
  const [selectedCapture, setSelectedCapture] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState({}); // { captureId: [comments] }
  const [commentInput, setCommentInput] = useState({}); // { captureId: 'text' }
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // captureId or null
  const [commentLikes, setCommentLikes] = useState({}); // { commentId: count }
  const [userCommentLikes, setUserCommentLikes] = useState({}); // { commentId: true }
  const [submittingComment, setSubmittingComment] = useState(null); // captureId
  const [expandedComments, setExpandedComments] = useState({}); // { captureId: true }

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        // Get user's region
        let userRegion = 'grand-rapids';
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('region')
            .eq('id', user.id)
            .single();
          if (profile?.region) {
            userRegion = profile.region;
          }
        }

        // Fetch all active captures for user's region
        const { data, error } = await supabase
          .from('event_captures')
          .select(`
            *,
            event_capture_photos (
              id,
              image_url,
              display_order
            )
          `)
          .eq('is_active', true)
          .eq('region_id', userRegion)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch like counts for each capture
        const capturesWithLikes = await Promise.all((data || []).map(async (capture) => {
          const { count } = await supabase
            .from('event_capture_likes')
            .select('*', { count: 'exact', head: true })
            .eq('event_capture_id', capture.id);

          return { ...capture, likeCount: count || 0 };
        }));

        // Split into recent (first 3) and archived (4-7), max 7 total
        const limitedCaptures = capturesWithLikes.slice(0, 7);
        const recent = limitedCaptures.slice(0, 3);
        const archived = limitedCaptures.slice(3, 7);

        setCaptures(recent);
        setArchivedCaptures(archived);

        // Fetch user's likes
        if (user) {
          const allCaptureIds = capturesWithLikes.map(c => c.id);
          if (allCaptureIds.length > 0) {
            const { data: likes } = await supabase
              .from('event_capture_likes')
              .select('event_capture_id')
              .eq('user_id', user.id)
              .in('event_capture_id', allCaptureIds);

            const likesMap = {};
            likes?.forEach(like => {
              likesMap[like.event_capture_id] = true;
            });
            setUserLikes(likesMap);
          }
        }
      } catch (error) {
        console.error('Error fetching event captures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaptures();
  }, [user]);

  const handleLike = async (e, captureId) => {
    e.stopPropagation();
    if (!user) return;

    const isLiked = userLikes[captureId];

    try {
      if (isLiked) {
        await supabase
          .from('event_capture_likes')
          .delete()
          .eq('event_capture_id', captureId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_capture_likes')
          .insert({ event_capture_id: captureId, user_id: user.id });
      }

      // Update local state
      setUserLikes(prev => ({ ...prev, [captureId]: !isLiked }));

      // Update both recent and archived captures
      const updateCaptures = (prev) => prev.map(m =>
        m.id === captureId
          ? { ...m, likeCount: isLiked ? m.likeCount - 1 : m.likeCount + 1 }
          : m
      );
      setCaptures(updateCaptures);
      setArchivedCaptures(updateCaptures);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Fetch comments for a capture
  const fetchComments = async (captureId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_capture_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!event_capture_comments_user_id_fkey (
            first_name,
            last_name,
            photo
          )
        `)
        .eq('event_capture_id', captureId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(prev => ({ ...prev, [captureId]: data || [] }));

      // Fetch like counts for comments
      if (data && data.length > 0) {
        const commentIds = data.map(c => c.id);

        // Get like counts
        const likeCounts = {};
        for (const commentId of commentIds) {
          const { count } = await supabase
            .from('event_capture_comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', commentId);
          likeCounts[commentId] = count || 0;
        }
        setCommentLikes(prev => ({ ...prev, ...likeCounts }));

        // Get user's likes
        const { data: userLikesData } = await supabase
          .from('event_capture_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const userLikesMap = {};
        userLikesData?.forEach(like => {
          userLikesMap[like.comment_id] = true;
        });
        setUserCommentLikes(prev => ({ ...prev, ...userLikesMap }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Post a comment
  const handlePostComment = async (captureId) => {
    if (!user || !commentInput[captureId]?.trim()) return;

    setSubmittingComment(captureId);
    try {
      const { data, error } = await supabase
        .from('event_capture_comments')
        .insert({
          event_capture_id: captureId,
          user_id: user.id,
          content: commentInput[captureId].trim()
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!event_capture_comments_user_id_fkey (
            first_name,
            last_name,
            photo
          )
        `)
        .single();

      if (error) throw error;

      // Add new comment to state
      setComments(prev => ({
        ...prev,
        [captureId]: [...(prev[captureId] || []), data]
      }));
      setCommentInput(prev => ({ ...prev, [captureId]: '' }));
      setCommentLikes(prev => ({ ...prev, [data.id]: 0 }));
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  // Like/unlike a comment
  const handleCommentLike = async (commentId) => {
    if (!user) return;

    const isLiked = userCommentLikes[commentId];

    try {
      if (isLiked) {
        await supabase
          .from('event_capture_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_capture_comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }

      setUserCommentLikes(prev => ({ ...prev, [commentId]: !isLiked }));
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: isLiked ? (prev[commentId] || 1) - 1 : (prev[commentId] || 0) + 1
      }));
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Delete own comment
  const handleDeleteComment = async (commentId, captureId) => {
    if (!user) return;

    try {
      await supabase
        .from('event_capture_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      setComments(prev => ({
        ...prev,
        [captureId]: (prev[captureId] || []).filter(c => c.id !== commentId)
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Report a comment
  const handleReportComment = async (commentId) => {
    if (!user) return;

    try {
      await supabase
        .from('event_capture_comment_reports')
        .insert({
          comment_id: commentId,
          reported_by: user.id,
          reason: 'Reported by user'
        });

      alert('Comment reported. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  // Toggle comments visibility
  const toggleComments = (captureId) => {
    const isExpanding = !expandedComments[captureId];
    setExpandedComments(prev => ({ ...prev, [captureId]: isExpanding }));

    // Fetch comments if expanding and not already loaded
    if (isExpanding && !comments[captureId]) {
      fetchComments(captureId);
    }
  };

  const openLightbox = (capture, photoIndex = 0) => {
    setSelectedCapture(capture);
    setSelectedPhotoIndex(photoIndex);
    setShowPhotoModal(true);
  };

  const closeLightbox = () => {
    setShowPhotoModal(false);
    setSelectedCapture(null);
    setSelectedPhotoIndex(0);
  };

  const navigatePhoto = (direction) => {
    if (!selectedCapture) return;
    const photos = selectedCapture.event_capture_photos.sort((a, b) => a.display_order - b.display_order);
    const newIndex = selectedPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setSelectedPhotoIndex(newIndex);
    }
  };

  // LinkedIn-style photo collage layout
  const renderPhotoCollage = (capture) => {
    const photos = (capture.event_capture_photos || []).sort((a, b) => a.display_order - b.display_order);
    if (photos.length === 0) return null;

    const photoCount = photos.length;

    // Single photo - full width
    if (photoCount === 1) {
      return (
        <div
          className="w-full h-56 rounded-lg overflow-hidden cursor-pointer border-2 border-gray-200"
          onClick={() => openLightbox(capture, 0)}
        >
          <img
            src={photos[0].image_url}
            alt={capture.event_name}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }

    // Two photos - lead image larger on left, second smaller on right
    if (photoCount === 2) {
      return (
        <div className="grid grid-cols-3 gap-1 h-64 rounded-lg overflow-hidden border-2 border-gray-200">
          <div
            className="col-span-2 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(capture, 0)}
          >
            <img
              src={photos[0].image_url}
              alt={`${capture.event_name} 1`}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div
            className="cursor-pointer overflow-hidden"
            onClick={() => openLightbox(capture, 1)}
          >
            <img
              src={photos[1].image_url}
              alt={`${capture.event_name} 2`}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      );
    }

    // Three photos - 1 large left (2/3), 2 stacked right (1/3)
    if (photoCount === 3) {
      return (
        <div className="grid grid-cols-3 gap-1 h-72 rounded-lg overflow-hidden border-2 border-gray-200">
          <div
            className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
            onClick={() => openLightbox(capture, 0)}
          >
            <img
              src={photos[0].image_url}
              alt={`${capture.event_name} 1`}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          {photos.slice(1).map((photo, idx) => (
            <div
              key={photo.id}
              className="cursor-pointer overflow-hidden"
              onClick={() => openLightbox(capture, idx + 1)}
            >
              <img
                src={photo.image_url}
                alt={`${capture.event_name} ${idx + 2}`}
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }

    // Four photos - 2x2 grid
    if (photoCount === 4) {
      return (
        <div className="grid grid-cols-2 gap-1 h-64 rounded-lg overflow-hidden border-2 border-gray-200">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="cursor-pointer overflow-hidden"
              onClick={() => openLightbox(capture, idx)}
            >
              <img
                src={photo.image_url}
                alt={`${capture.event_name} ${idx + 1}`}
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }

    // Five+ photos - 1 large left (2/3), 2 stacked right (1/3) with +X overlay
    return (
      <div className="grid grid-cols-3 gap-1 h-72 rounded-lg overflow-hidden border-2 border-gray-200">
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
          onClick={() => openLightbox(capture, 0)}
        >
          <img
            src={photos[0].image_url}
            alt={`${capture.event_name} 1`}
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
          />
        </div>
        {photos.slice(1, 3).map((photo, idx) => (
          <div
            key={photo.id}
            className="cursor-pointer overflow-hidden relative"
            onClick={() => openLightbox(capture, idx + 1)}
          >
            <img
              src={photo.image_url}
              alt={`${capture.event_name} ${idx + 2}`}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
            />
            {/* Show +X overlay on last visible photo if there are more */}
            {idx === 1 && photoCount > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{photoCount - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCaptureCard = (capture) => (
    <div
      key={capture.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Photo Collage */}
      {renderPhotoCollage(capture)}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{capture.event_name}</h3>
            <p className="text-sm text-gray-500">{capture.event_date}</p>
            {capture.organization_name && (
              <p className="text-sm text-gray-600 mt-1">
                Hosted by{' '}
                {capture.organization_url ? (
                  <a
                    href={capture.organization_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#009900] hover:underline"
                  >
                    {capture.organization_name}
                  </a>
                ) : (
                  capture.organization_name
                )}
              </p>
            )}
            {capture.description && (
              <p className="text-sm text-gray-700 mt-2">{capture.description}</p>
            )}
            {capture.photo_credit && (
              <p className="text-xs text-gray-400 mt-1 italic">Photo: {capture.photo_credit}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => handleLike(e, capture.id)}
            className={`flex items-center gap-1 text-sm font-medium ${
              userLikes[capture.id]
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-400'
            } transition-colors`}
          >
            <Heart className={`w-5 h-5 ${userLikes[capture.id] ? 'fill-current' : ''}`} />
            <span>{capture.likeCount} {capture.likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
          {user && (
            <button
              onClick={() => toggleComments(capture.id)}
              className={`flex items-center gap-1 text-sm font-medium ${
                expandedComments[capture.id]
                  ? 'text-[#009900]'
                  : 'text-gray-500 hover:text-[#009900]'
              } transition-colors`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comments{comments[capture.id]?.length > 0 ? ` (${comments[capture.id].length})` : ''}</span>
            </button>
          )}
          <button
            onClick={() => {
              setSelectedCapture(capture);
              setShowShareModal(true);
            }}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#009900] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {user && expandedComments[capture.id] && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Comment Input */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentInput[capture.id] || ''}
                  onChange={(e) => setCommentInput(prev => ({ ...prev, [capture.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment(capture.id);
                    }
                  }}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  disabled={submittingComment === capture.id}
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(showEmojiPicker === capture.id ? null : capture.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
                {showEmojiPicker === capture.id && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setCommentInput(prev => ({
                          ...prev,
                          [capture.id]: (prev[capture.id] || '') + emojiData.emoji
                        }));
                        setShowEmojiPicker(null);
                      }}
                      width={280}
                      height={350}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => handlePostComment(capture.id)}
                disabled={!commentInput[capture.id]?.trim() || submittingComment === capture.id}
                className="px-3 py-2 bg-[#009900] text-white rounded-lg hover:bg-[#007700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(comments[capture.id] || []).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
              ) : (
                (comments[capture.id] || []).map((comment) => (
                  <div key={comment.id} className="flex gap-2 group">
                    {/* Avatar */}
                    {comment.users?.photo ? (
                      <img
                        src={comment.users.photo}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#009900] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {comment.users?.first_name?.[0] || '?'}{comment.users?.last_name?.[0] || ''}
                        </span>
                      </div>
                    )}
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.users?.first_name} {comment.users?.last_name?.[0]}.
                        </p>
                        <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                      </div>
                      {/* Comment Actions */}
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center gap-1 ${
                            userCommentLikes[comment.id]
                              ? 'text-red-500'
                              : 'text-gray-400 hover:text-red-400'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${userCommentLikes[comment.id] ? 'fill-current' : ''}`} />
                          {commentLikes[comment.id] > 0 && <span>{commentLikes[comment.id]}</span>}
                        </button>
                        {comment.user_id === user.id ? (
                          <button
                            onClick={() => handleDeleteComment(comment.id, capture.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReportComment(comment.id)}
                            className="text-gray-400 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Report comment"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Content that's shared between embedded and standalone modes
  const mainContent = (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => embedded && onBackToDashboard ? onBackToDashboard() : navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Captures</h1>
          <p className="text-gray-600 mt-1">The BudE community out on the town</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009900] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event captures...</p>
        </div>
      )}

      {/* No captures */}
      {!loading && captures.length === 0 && archivedCaptures.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Event Captures Yet</h3>
          <p className="text-gray-500 mb-4">Be the first to share photos from a networking event!</p>
          <button
            onClick={() => setShowPhotoRequestModal(true)}
            className="bg-[#009900] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#007700] transition-colors"
          >
            Share Your Photos
          </button>
        </div>
      )}

      {/* Recent Captures */}
      {!loading && captures.length > 0 && (
        <div className="space-y-6 mb-8">
          {captures.map(renderCaptureCard)}
        </div>
      )}

      {/* Share Your Photos CTA */}
      {!loading && captures.length > 0 && (
        <div className="text-center mb-12">
          <button
            onClick={() => setShowPhotoRequestModal(true)}
            className="bg-[#D0ED00] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#bfd400] transition-colors inline-flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Share Your Photos
          </button>
        </div>
      )}

      {/* More Captures */}
      {!loading && archivedCaptures.length > 0 && (
        <div className="border-t border-gray-300 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">More Captures</h2>
            <p className="text-gray-600">Earlier event highlights</p>
          </div>
          <div className="space-y-6">
            {archivedCaptures.map(renderCaptureCard)}
          </div>
        </div>
      )}
    </div>
  );

  // Modals (shared between both modes)
  const modals = (
    <>
      {/* Lightbox Modal */}
      {showPhotoModal && selectedCapture && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {selectedPhotoIndex > 0 && (
              <button
                onClick={() => navigatePhoto(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white hover:text-gray-300 p-2"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}
            {selectedCapture.event_capture_photos && selectedPhotoIndex < selectedCapture.event_capture_photos.length - 1 && (
              <button
                onClick={() => navigatePhoto(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white hover:text-gray-300 p-2"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            <img
              src={selectedCapture.event_capture_photos?.sort((a, b) => a.display_order - b.display_order)[selectedPhotoIndex]?.image_url}
              alt={selectedCapture.event_name}
              className="max-w-full max-h-[85vh] mx-auto object-contain rounded-lg"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <h3 className="text-white font-bold text-lg">{selectedCapture.event_name}</h3>
              <p className="text-gray-300 text-sm">{selectedCapture.event_date}</p>
              {selectedCapture.photo_credit && (
                <p className="text-gray-400 text-xs mt-1">Photo: {selectedCapture.photo_credit}</p>
              )}
              <p className="text-gray-400 text-xs mt-2">
                {selectedPhotoIndex + 1} of {selectedCapture.event_capture_photos?.length || 1}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCapture && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowShareModal(false);
            setLinkCopied(false);
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowShareModal(false);
                setLinkCopied(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Event Capture</h3>
              <p className="text-sm text-gray-600">{selectedCapture.event_name}</p>
            </div>

            {/* Link Display with Copy Button */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Share Link:</p>
                  <p className="text-sm font-mono text-gray-900 truncate">{`https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`}</p>
                </div>
                <button
                  onClick={() => {
                    try {
                      const shareUrl = `https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`;
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }).catch(() => {
                          prompt('Copy this link:', shareUrl);
                        });
                      } else {
                        prompt('Copy this link:', shareUrl);
                      }
                    } catch (err) {
                      const shareUrl = `https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`;
                      prompt('Copy this link:', shareUrl);
                    }
                  }}
                  className="flex-shrink-0 bg-[#009900] text-white px-4 py-2 rounded-lg hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] flex items-center gap-2"
                >
                  {linkCopied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Share to:</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#145dbf] transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`)}&text=${encodeURIComponent('Check out this event capture: ' + selectedCapture.event_name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Check out this event capture: ' + selectedCapture.event_name)}&body=${encodeURIComponent('I thought you might enjoy these photos from this event:\n\n' + selectedCapture.event_name + '\n\n' + `https://www.networkingbude.com/api/share/capture/${selectedCapture.id}`)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setLinkCopied(false);
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Photo Request Modal */}
      {showPhotoRequestModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !photoRequestSubmitted && setShowPhotoRequestModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-4 border-4 border-[#D0ED00] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {photoRequestSubmitted ? (
              <div className="text-center py-6">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 text-sm">Your submission is being reviewed.</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowPhotoRequestModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
                <div className="text-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Share Your Event Photos</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Upload photos from a networking event and we'll check them out!</p>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) {
                      alert('Please log in to submit photos.');
                      return;
                    }
                    setSubmittingRequest(true);
                    setUploadProgress('');
                    const formData = new FormData(e.target);

                    try {
                      let photoUrls = [];

                      // Upload photos to Supabase storage if any
                      if (selectedPhotos.length > 0) {
                        setUploadProgress('Compressing photos...');

                        // Compression options
                        const compressionOptions = {
                          maxSizeMB: 0.5, // Max 500KB per image
                          maxWidthOrHeight: 1920, // Max dimension
                          useWebWorker: true,
                          fileType: 'image/jpeg'
                        };

                        for (let i = 0; i < selectedPhotos.length; i++) {
                          const file = selectedPhotos[i];

                          // Compress the image
                          setUploadProgress(`Compressing photo ${i + 1} of ${selectedPhotos.length}...`);
                          let compressedFile;
                          try {
                            compressedFile = await imageCompression(file, compressionOptions);
                            console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
                          } catch (compressError) {
                            console.warn('Compression failed, using original:', compressError);
                            compressedFile = file;
                          }

                          const fileName = `${user.id}/${Date.now()}-${i}.jpg`;

                          setUploadProgress(`Uploading photo ${i + 1} of ${selectedPhotos.length}...`);
                          const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('user-submitted-event-photos')
                            .upload(fileName, compressedFile, {
                              cacheControl: '3600',
                              upsert: false,
                              contentType: 'image/jpeg'
                            });

                          if (uploadError) {
                            console.error('Upload error:', uploadError);
                            throw new Error(`Failed to upload photo ${i + 1}`);
                          }

                          // Get public URL
                          const { data: { publicUrl } } = supabase.storage
                            .from('user-submitted-event-photos')
                            .getPublicUrl(fileName);

                          photoUrls.push(publicUrl);
                        }
                      }

                      setUploadProgress('Saving submission...');

                      // Save to Supabase table
                      const { error: dbError } = await supabase
                        .from('user_photo_submissions')
                        .insert({
                          user_id: user.id,
                          submitter_name: formData.get('name'),
                          submitter_email: formData.get('email'),
                          event_name: formData.get('eventName'),
                          event_date: formData.get('eventDate'),
                          notes: formData.get('notes'),
                          photo_urls: photoUrls,
                          status: 'pending'
                        });

                      if (dbError) {
                        console.error('Database error:', dbError);
                        throw new Error('Failed to save submission');
                      }

                      // Also send to Google Sheet for notification
                      const imagesUploaded = photoUrls.length > 0
                        ? `Yes (${photoUrls.length} photo${photoUrls.length > 1 ? 's' : ''})`
                        : 'No';

                      await fetch('/api/submitPhotoRequest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          submitterName: formData.get('name'),
                          submitterEmail: formData.get('email'),
                          eventName: formData.get('eventName'),
                          eventDate: formData.get('eventDate'),
                          notes: formData.get('notes'),
                          imagesUploaded
                        })
                      });

                      setPhotoRequestSubmitted(true);
                      setSelectedPhotos([]);
                      setUploadProgress('');
                      setTimeout(() => {
                        setPhotoRequestSubmitted(false);
                        setShowPhotoRequestModal(false);
                      }, 3000);
                    } catch (error) {
                      console.error('Error:', error);
                      alert('There was an error submitting your request. Please try again.');
                      setUploadProgress('');
                    } finally {
                      setSubmittingRequest(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={user?.user_metadata?.full_name || ''}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Your Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={user?.email || ''}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Event Name *</label>
                      <input
                        type="text"
                        name="eventName"
                        required
                        placeholder="e.g., GR Tech Meetup"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Event Date *</label>
                      <input
                        type="text"
                        name="eventDate"
                        required
                        placeholder="e.g., Dec 2025"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Any additional details..."
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>

                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Upload Photos (max 3)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#009900] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 3) {
                            alert('Maximum 3 photos allowed');
                            e.target.value = '';
                            return;
                          }
                          const oversized = files.find(f => f.size > 5 * 1024 * 1024);
                          if (oversized) {
                            alert('Each photo must be under 5MB');
                            e.target.value = '';
                            return;
                          }
                          setSelectedPhotos(files);
                        }}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {selectedPhotos.length === 0 ? (
                          <div className="py-2">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Click to select photos</p>
                            <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                          </div>
                        ) : (
                          <div className="py-1">
                            <div className="flex justify-center gap-2 mb-1">
                              {selectedPhotos.map((file, idx) => (
                                <img
                                  key={idx}
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ))}
                            </div>
                            <p className="text-xs text-[#009900] font-medium">
                              {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : ''} selected
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {selectedPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhotos([]);
                          const input = document.getElementById('photo-upload');
                          if (input) input.value = '';
                        }}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {uploadProgress && (
                    <p className="text-xs text-[#009900] text-center">{uploadProgress}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="flex-1 bg-[#009900] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] disabled:opacity-50"
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoRequestModal(false);
                        setSelectedPhotos([]);
                        setUploadProgress('');
                      }}
                      className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );

  // Embedded mode - just return the content without wrapper layout
  if (embedded) {
    return (
      <div className="p-4 md:p-8 overflow-y-auto bg-gray-50 min-h-full">
        {mainContent}
        {modals}
      </div>
    );
  }

  // Standalone mode - full page with Sidebar
  return (
    <>
      {/* Top banner */}
      <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base relative z-20">
        <span className="font-medium">The BudE community in pictures</span>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeTab="captures"
          setActiveTab={(tab) => {
            if (tab === 'dashboard') navigate('/dashboard');
            else if (tab === 'events') navigate('/events');
            else if (tab === 'connections') navigate('/dashboard?tab=connections');
            else if (tab === 'messages') navigate('/dashboard?tab=messages');
            else if (tab === 'resources') navigate('/resources-insights');
            else navigate('/dashboard');
          }}
          onContactUsClick={() => setShowContactModal(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {mainContent}
        </main>
      </div>

      {modals}
    </>
  );
}

export default EventCaptures;
