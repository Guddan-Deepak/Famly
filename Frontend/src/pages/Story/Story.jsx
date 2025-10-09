import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../utils/authContext";
import api from "../../utils/axios";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Users,
  Calendar,
  Tag,
  User,
  Crown,
  Home,
  Save,
  X
} from "lucide-react";

const StoryPage = () => {
  const { storyId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editFormData, setEditFormData] = useState({ caption: "" });
  const [userPermissions, setUserPermissions] = useState({
    isStoryOwner: false,
    isFamilyAdmin: false,
    canEditDelete: false
  });

  const currentUser = auth?.user;
  const currentMedia = story?.media?.[currentMediaIndex];

  // Fetch story details and check permissions
  const fetchStory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/content/${storyId}`);
      const storyData = res.data.data;
      
      setStory(storyData);
      setIsLiked(storyData.liked_by?.includes(currentUser?.user_id) || false);
      setLikesCount(storyData.liked_by?.length || 0);
      setEditFormData({ caption: storyData.caption || "" });

      // Check user permissions
      await checkUserPermissions(storyData);
      
    } catch (err) {
      console.error("Error fetching story:", err);
      setError("Failed to load story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to edit/delete
  const checkUserPermissions = async (storyData) => {
    try {
      const isStoryOwner = currentUser?.user_id === storyData.uploaded_by?.user_id;
      
      // Check if user is admin of the family
      let isFamilyAdmin = false;
      if (storyData.family_id) {
        const familyRes = await api.get(`/family/${storyData.family_id}`);
        const familyData = familyRes.data.data;
        
        // Check if current user is the admin of this family
        isFamilyAdmin = familyData.created_by === currentUser?.user_id.toString();
      }

      const canEditDelete = isStoryOwner || isFamilyAdmin;

      setUserPermissions({
        isStoryOwner,
        isFamilyAdmin,
        canEditDelete
      });

    } catch (err) {
      console.error("Error checking user permissions:", err);
      // If we can't verify admin status, only allow story owner
      const isStoryOwner = currentUser?.user_id === storyData.uploaded_by?.user_id;
      setUserPermissions({
        isStoryOwner,
        isFamilyAdmin: false,
        canEditDelete: isStoryOwner
      });
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStory();
    }
  }, [storyId, currentUser?.user_id]);

  // Media navigation
  const goToNextMedia = () => {
    if (story?.media?.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % story.media.length);
    }
  };

  const goToPrevMedia = () => {
    if (story?.media?.length > 1) {
      setCurrentMediaIndex((prev) => (prev - 1 + story.media.length) % story.media.length);
    }
  };

  // Story actions
 const handleLike = async () => {
  if (actionLoading) return;
  
  try {
    setActionLoading(true);
    if (isLiked) {
      // Unlike the story
      await api.delete(`/content/unlike/${storyId}`);
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      // Like the story
      await api.post(`/content/like/${storyId}`);
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    alert("Failed to update like. Please try again.");
  } finally {
    setActionLoading(false);
  }
};

  const handleEdit = () => {
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      await api.put(`/content/update/${storyId}`, {
        caption: editFormData.caption
      });
      
      // Refresh the story data to show updated caption
      await fetchStory();
      setShowEditPopup(false);
    } catch (err) {
      console.error("Error updating story:", err);
      alert("Failed to update story. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      await api.delete(`/content/delete/${storyId}`);
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error("Error deleting story:", err);
      alert("Failed to delete story. Please try again.");
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.caption,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Render media content
  const renderMedia = (mediaItem) => {
    if (!mediaItem) return null;

    switch (mediaItem.type) {
      case "image":
        return (
          <img
            src={mediaItem.url}
            alt="Story media"
            className="w-full h-full object-contain bg-black"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600/EEEEEE/808080?text=Image+Not+Found';
            }}
          />
        );
      case "video":
        return (
          <video
            controls
            className="w-full h-full object-contain bg-black"
            preload="metadata"
          >
            <source src={mediaItem.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case "audio":
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 p-8">
            <audio controls className="w-full max-w-md">
              <source src={mediaItem.url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "text":
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-200">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {mediaItem.text}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
            Unsupported media type
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-600 font-medium mt-4">Loading story...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md">
          <p className="text-red-600 font-medium text-lg mb-4">
            {error || "Story not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 text-white py-2 px-6 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Show Edit/Delete only for story owner or family admin */}
              {userPermissions.canEditDelete && (
                <>
                  <button
                    onClick={handleEdit}
                    disabled={actionLoading}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                  >
                    <Edit size={18} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={18} className="mr-1" />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 size={18} className="mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Media Display */}
              <div className="relative aspect-[4/3] bg-black">
                {renderMedia(currentMedia)}
                
                {/* Media Navigation */}
                {story.media.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <button
                      onClick={goToNextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ArrowLeft size={24} className="rotate-180" />
                    </button>
                    
                    {/* Media Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentMediaIndex + 1} / {story.media.length}
                    </div>
                  </>
                )}
              </div>

              {/* Story Content */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {story.title}
                </h1>
                
                {story.caption && (
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                    {story.caption}
                  </p>
                )}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
                      >
                        <Tag size={14} className="mr-1" />
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      disabled={actionLoading}
                      className={`flex items-center transition-colors ${
                        isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                      } disabled:opacity-50`}
                    >
                      <Heart 
                        size={24} 
                        fill={isLiked ? 'currentColor' : 'none'} 
                        className="mr-2" 
                      />
                      <span className="font-medium">{likesCount}</span>
                    </button>
                    
                    <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors">
                      <MessageCircle size={24} className="mr-2" />
                      <span className="font-medium">Comment</span>
                    </button>
                    
                    <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors">
                      <Bookmark size={24} className="mr-2" />
                      <span className="font-medium">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Media Thumbnails */}
            {story.media.length > 1 && (
              <div className="mt-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {story.media.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentMediaIndex === index 
                          ? 'border-purple-600' 
                          : 'border-gray-300'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {media.type === 'video' && '🎬'}
                          {media.type === 'audio' && '🎵'}
                          {media.type === 'text' && '📝'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info Sidebar */}
          <div className="space-y-6">
            {/* Uploader Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2 text-purple-600" />
                Story Creator
              </h3>
              
              <div className="flex items-center space-x-3">
                <img
                  src={story.uploaded_by?.profilePhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=👤'}
                  alt={story.uploaded_by?.fullname}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {story.uploaded_by?.fullname || "Unknown User"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    @{story.uploaded_by?.username || "user"}
                  </p>
                </div>
              </div>
              
              {/* Show ownership/admin badges */}
              <div className="mt-3 space-y-1">
                {userPermissions.isStoryOwner && (
                  <div className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block mr-2">
                    You created this story
                  </div>
                )}
                {userPermissions.isFamilyAdmin && !userPermissions.isStoryOwner && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full inline-block">
                    <Crown size={12} className="inline mr-1" />
                    Family Admin
                  </div>
                )}
              </div>
            </div>

            {/* Family Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home size={20} className="mr-2 text-purple-600" />
                Family
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={story.family_info.familyPhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=🏠'}
                    alt={story.family_info.family_name}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {story.family_info.family_name || "Unknown Family"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Family ID: {story.family_id}
                    </p>
                  </div>
                </div>
                
                
              </div>
            </div>

            {/* Story Metadata */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-3 text-purple-600" />
                  <div>
                    <p className="font-medium">Memory Date</p>
                    <p className="text-sm">
                      {new Date(story.memory_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-3 text-purple-600" />
                  <div>
                    <p className="font-medium">Posted On</p>
                    <p className="text-sm">
                      {new Date(story.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users size={18} className="mr-3 text-purple-600" />
                  <div>
                    <p className="font-medium">Likes</p>
                    <p className="text-sm">{likesCount} people liked this</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Story Popup */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Story</h3>
              <button
                onClick={() => setShowEditPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="p-6">
              {/* Story Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h4>
                <p className="text-gray-600 text-sm">You can only edit the caption of this story.</p>
              </div>

              <div className="mb-6">
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                  Story Caption
                </label>
                <textarea
                  id="caption"
                  name="caption"
                  rows={6}
                  value={editFormData.caption}
                  onChange={handleEditFormChange}
                  placeholder="Tell the story behind this memory..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {editFormData.caption.length}/500 characters
                </p>
              </div>

              {/* Media Preview */}
              {story.media && story.media.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media ({story.media.length} items)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {story.media.map((media, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {media.type === 'image' && (
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        {media.type === 'video' && (
                          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Video</span>
                          </div>
                        )}
                        {media.type === 'audio' && (
                          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Audio</span>
                          </div>
                        )}
                        {media.type === 'text' && (
                          <div className="w-full h-32 bg-gray-200 flex items-center justify-center p-2">
                            <span className="text-gray-500 text-sm line-clamp-3">
                              {media.text}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
                >
                  <Save size={18} className="mr-2" />
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Story</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this story? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPage;