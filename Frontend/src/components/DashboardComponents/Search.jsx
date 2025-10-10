import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/authContext';
import api from '../../utils/axios';
import './Search.css';

const Search = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [adminFamily, setAdminFamily] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const limit = 12;

  // Fetch user profile to get admin family
  const fetchUserProfile = useCallback(async () => {
    if (!auth?.user?.user_id) {
      setProfileLoading(false);
      return;
    }

    try {
      const response = await api.get(`/user/${auth.user.user_id}/profile`);
      const { data } = response;
      
      if (data.success && data.data.families) {
        // Find family where user is admin
        const adminFamilyData = data.data.families.find(
          family => family.Membership?.role === 'admin'
        );
        setAdminFamily(adminFamilyData || null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  }, [auth]);

  // Fetch stories based on current mode (search or browse)
  const fetchStories = useCallback(async (page = 1, query = '') => {
    if (!adminFamily) return;

    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (query.trim()) {
        // Search mode
        response = await api.get(`/content/${adminFamily.family_id}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        setSearchMode(true);
      } else {
        // Browse mode - get all stories sorted
        const endpoint = sortOrder === 'asc' ? 'asc' : 'desc';
        response = await api.get(`/content/family/${adminFamily.family_id}/${endpoint}?page=${page}&limit=${limit}`);
        setSearchMode(false);
      }

      const { data } = response;
      setStories(data.data?.stories || data.data || []);
      setTotalPages(data.data?.pagination?.totalPages || 1);
      setTotalStories(data.data?.pagination?.total || data.data?.metadata?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories. Please try again.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [adminFamily, sortOrder]);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch stories when admin family is available or when sort order changes
  useEffect(() => {
    if (adminFamily) {
      fetchStories(1, searchQuery);
    }
  }, [adminFamily, fetchStories, sortOrder]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!adminFamily) return;
    
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }
    fetchStories(1, searchQuery);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchMode(false);
    setError('');
    if (adminFamily) {
      fetchStories(1, '');
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (adminFamily) {
      fetchStories(newPage, searchQuery);
    }
  };

  // Handle like/unlike
  const handleLike = async (storyId, currentlyLiked, e) => {
    e.stopPropagation();
    if (!adminFamily) return;
    
    try {
      if (currentlyLiked) {
        await api.post(`/content/unlike/${storyId}`);
      } else {
        await api.post(`/content/like/${storyId}`);
      }
      
      // Refresh the current view to update likes
      fetchStories(currentPage, searchQuery);
    } catch (err) {
      console.error('Error updating like:', err);
      setError('Failed to update like. Please try again.');
    }
  };

  // Handle story click
  const handleStoryClick = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  // Handle create family
  const handleCreateFamily = () => {
    navigate('/create-family');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render media content
  const renderMedia = (media) => {
    if (!media) return null;
    
    if (media.type === 'image') {
      return (
        <img 
          src={media.url} 
          alt={media.text || 'Story image'} 
          className="story-media"
          loading="lazy"
        />
      );
    } else if (media.type === 'video') {
      return (
        <video 
          controls 
          className="story-media"
          poster={media.thumbnailUrl}
        >
          <source src={media.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (media.type === 'audio') {
      return (
        <div className="audio-container">
          <audio controls className="story-audio">
            <source src={media.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (media.type === 'text') {
      return (
        <div className="story-text-media">
          <p>{media.text}</p>
        </div>
      );
    }
    return null;
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn prev"
        >
          ← Previous
        </button>
        
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn next"
        >
          Next →
        </button>
      </div>
    );
  };

  // Loading state for profile
  if (profileLoading) {
    return (
      <div className="story-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your family information...</p>
        </div>
      </div>
    );
  }

  // No admin family state
  if (!adminFamily) {
    return (
      <div className="story-container">
        <div className="no-family-state">
          <div className="no-family-icon">🏠</div>
          <h2>No Family Found</h2>
          <p>You haven't created any family yet where you are an admin.</p>
          <p className="suggestion">
            Create a family to start sharing stories and memories with your loved ones!
          </p>
          <button onClick={handleCreateFamily} className="create-family-btn">
            🏠 Create Your Family
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-container">
      {/* Header with Family Info */}
      <div className="family-header">
        <div className="family-info">
          {adminFamily.familyPhoto && (
            <img 
              src={adminFamily.familyPhoto} 
              alt={adminFamily.family_name}
              className="family-photo"
            />
          )}
          <div className="family-details">
            <h1>🏠 {adminFamily.family_name}'s Stories</h1>
            <p className="family-description">
              {adminFamily.description || 'Share and explore your family memories'}
            </p>
            <div className="family-meta">
              <span className="family-code">
                📋 Invitation Code: <strong>{adminFamily.invitation_code}</strong>
              </span>
              <span className="admin-badge">👑 Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="controls-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <div className="search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError('');
                }}
                placeholder="Search stories by title, caption, tags, or content..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍 Search
              </button>
            </div>
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="clear-search-btn"
              >
                ✕ Clear
              </button>
            )}
          </div>
          {error && searchQuery.trim() === '' && (
            <div className="search-error">Please enter a search term</div>
          )}
        </form>

        <div className="view-controls">
          <label className="sort-label">Sort by:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="desc">🆕 Newest First</option>
            <option value="asc">📅 Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="results-info">
          {searchMode ? (
            <p>
              🔍 Search results for "<strong>{searchQuery}</strong>" - 
              Found {totalStories} story{totalStories !== 1 ? 's' : ''}
            </p>
          ) : (
            <p>
              📚 Browsing all stories in {adminFamily.family_name} - {totalStories} story{totalStories !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && searchQuery.trim() && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading stories...</p>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && stories.length > 0 && (
        <>
          <div className="stories-grid">
            {stories.map((story) => (
              <div 
                key={story._id} 
                className="story-card"
                onClick={() => handleStoryClick(story._id)}
              >
                {/* Story Media */}
                {story.media && story.media.length > 0 && (
                  <div className="story-media-container">
                    {renderMedia(story.media[0])}
                    {story.media.length > 1 && (
                      <div className="media-count-badge">
                        +{story.media.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                {/* Story Content */}
                <div className="story-content">
                  <h3 className="story-title">{story.title}</h3>
                  
                  {story.caption && (
                    <p className="story-caption">{story.caption}</p>
                  )}

                  {/* Tags */}
                  {story.tags && story.tags.length > 0 && (
                    <div className="story-tags">
                      {story.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="tag-more">
                          +{story.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Story Metadata */}
                  <div className="story-meta">
                    <div className="uploader-info">
                      {story.uploaded_by?.profilePhoto ? (
                        <img 
                          src={story.uploaded_by.profilePhoto} 
                          alt={story.uploaded_by.fullname}
                          className="uploader-avatar"
                        />
                      ) : (
                        <div className="uploader-avatar-placeholder">
                          {story.uploaded_by?.fullname?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="uploader-name">
                        {story.uploaded_by?.fullname || 'Unknown User'}
                      </span>
                    </div>

                    <div className="story-date">
                      📅 {formatDate(story.memory_date || story.createdAt)}
                    </div>
                  </div>

                  {/* Like Button */}
                  <div className="story-actions">
                    <button
                      onClick={(e) => handleLike(
                        story._id, 
                        story.liked_by?.includes(auth?.user?.user_id),
                        e
                      )}
                      className={`like-btn ${story.liked_by?.includes(auth?.user?.user_id) ? 'liked' : ''}`}
                    >
                      ❤️ {story.liked_by?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Empty State */}
      {!loading && stories.length === 0 && (
        <div className="empty-state">
          {searchMode ? (
            <>
              <div className="empty-icon">🔍</div>
              <h3>No stories found</h3>
              <p>We couldn't find any stories matching "<strong>{searchQuery}</strong>"</p>
              <p className="suggestion">Try different keywords or search terms</p>
              <button onClick={handleClearSearch} className="browse-all-btn">
                📚 Browse All Stories
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">📖</div>
              <h3>No stories yet in {adminFamily.family_name}</h3>
              <p>Your family hasn't shared any memories yet.</p>
              <p className="suggestion">Be the first to create a beautiful memory for your family!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;