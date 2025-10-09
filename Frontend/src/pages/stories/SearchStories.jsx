// // src/pages/FamilyStoriesSearch.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import api from '../../utils/axios';
// import './FamilyStoriesSearch.css';

// const FamilyStoriesSearch = () => {
//   const { familyId } = useParams();
//   const [stories, setStories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalStories, setTotalStories] = useState(0);
//   const [error, setError] = useState('');
//   const [searchMode, setSearchMode] = useState(false); // true when user searches

//   const limit = 12;

//   // Fetch stories based on current mode (search or browse)
//   const fetchStories = useCallback(async (page = 1, query = '') => {
//     setLoading(true);
//     setError('');
    
//     try {
//       let response;
      
//       if (query.trim()) {
//         // Search mode
//         response = await api.get(`/content/${familyId}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
//         setSearchMode(true);
        
//       } else {
//         // Browse mode - get all stories sorted
//         const endpoint = sortOrder === 'asc' ? 'asc' : 'desc';
//         response = await api.get(`/content/${familyId}/search/${endpoint}?page=${page}&limit=${limit}`);
//         setSearchMode(false);
//       }

//       const { data } = response;
//       setStories(data.data?.stories || data.data || []);
//       setTotalPages(data.data?.pagination?.totalPages || 1);
//       setTotalStories(data.data?.pagination?.total || data.data?.metadata?.total || 0);
//       setCurrentPage(page);
//     } catch (err) {
//       console.error('Error fetching stories:', err);
//       setError('Failed to load stories. Please try again.');
//       setStories([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [familyId, sortOrder]);

//   // Initial load and when sort order changes
//   useEffect(() => {
//     fetchStories(1, searchQuery);
//   }, [fetchStories, sortOrder]);

//   // Handle search
//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchStories(1, searchQuery);
//   };

//   // Handle clear search
//   const handleClearSearch = () => {
//     setSearchQuery('');
//     setSearchMode(false);
//     fetchStories(1, '');
//   };

//   // Handle pagination
//   const handlePageChange = (newPage) => {
//     fetchStories(newPage, searchQuery);
//   };

//   // Handle like/unlike
//   const handleLike = async (storyId, currentlyLiked) => {
//     try {
//       if (currentlyLiked) {
//         await api.post(`/story/unlike/${storyId}`);
//       } else {
//         await api.post(`/story/like/${storyId}`);
//       }
      
//       // Refresh the current view to update likes
//       fetchStories(currentPage, searchQuery);
//     } catch (err) {
//       console.error('Error updating like:', err);
//       setError('Failed to update like. Please try again.');
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   // Render media content
//   const renderMedia = (media) => {
//     if (media.type === 'image') {
//       return (
//         <img 
//           src={media.url} 
//           alt={media.text || 'Story image'} 
//           className="story-media"
//           loading="lazy"
//         />
//       );
//     } else if (media.type === 'video') {
//       return (
//         <video 
//           controls 
//           className="story-media"
//           poster={media.thumbnail}
//         >
//           <source src={media.url} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       );
//     } else if (media.type === 'audio') {
//       return (
//         <audio controls className="story-media">
//           <source src={media.url} type="audio/mpeg" />
//           Your browser does not support the audio element.
//         </audio>
//       );
//     } else if (media.type === 'text') {
//       return (
//         <div className="story-text-media">
//           <p>{media.text}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Render pagination controls
//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     return (
//       <div className="pagination">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="pagination-btn"
//         >
//           Previous
//         </button>
        
//         <span className="page-info">
//           Page {currentPage} of {totalPages}
//         </span>
        
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="pagination-btn"
//         >
//           Next
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="family-stories-search">
//       {/* Header */}
//       <div className="search-header">
//         <h1>Family Stories</h1>
//         <p>Discover and search through your family memories</p>
//       </div>

//       {/* Search and Controls */}
//       <div className="controls-section">
//         <form onSubmit={handleSearch} className="search-form">
//           <div className="search-input-group">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search stories by keywords, tags, or content..."
//               className="search-input"
//             />
//             <button type="submit" className="search-btn">
//               Search
//             </button>
//             {searchQuery && (
//               <button 
//                 type="button" 
//                 onClick={handleClearSearch}
//                 className="clear-search-btn"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </form>

//         <div className="view-controls">
//           <select 
//             value={sortOrder} 
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="sort-select"
//           >
//             <option value="desc">Newest First</option>
//             <option value="asc">Oldest First</option>
//           </select>
//         </div>
//       </div>

//       {/* Results Info */}
//       <div className="results-info">
//         {searchMode ? (
//           <p>
//             Search results for "<strong>{searchQuery}</strong>" - 
//             Found {totalStories} story{totalStories !== 1 ? 's' : ''}
//           </p>
//         ) : (
//           <p>
//             Showing all stories - {totalStories} story{totalStories !== 1 ? 's' : ''} total
//           </p>
//         )}
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       {/* Loading State */}
//       {loading && (
//         <div className="loading-state">
//           <div className="spinner"></div>
//           <p>Loading stories...</p>
//         </div>
//       )}

//       {/* Stories Grid */}
//       {!loading && stories.length > 0 && (
//         <>
//           <div className="stories-grid">
//             {stories.map((story) => (
//               <div key={story._id} className="story-card">
//                 {/* Story Media */}
//                 {story.media && story.media.length > 0 && (
//                   <div className="story-media-container">
//                     {renderMedia(story.media[0])}
//                     {story.media.length > 1 && (
//                       <div className="media-count-badge">
//                         +{story.media.length - 1} more
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Story Content */}
//                 <div className="story-content">
//                   <h3 className="story-title">{story.title}</h3>
                  
//                   {story.caption && (
//                     <p className="story-caption">{story.caption}</p>
//                   )}

//                   {/* Tags */}
//                   {story.tags && story.tags.length > 0 && (
//                     <div className="story-tags">
//                       {story.tags.slice(0, 3).map((tag, index) => (
//                         <span key={index} className="tag">
//                           #{tag}
//                         </span>
//                       ))}
//                       {story.tags.length > 3 && (
//                         <span className="tag-more">
//                           +{story.tags.length - 3} more
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   {/* Story Metadata */}
//                   <div className="story-meta">
//                     <div className="uploader-info">
//                       {story.uploaded_by_user?.profilePhoto ? (
//                         <img 
//                           src={story.uploaded_by_user.profilePhoto} 
//                           alt={story.uploaded_by_user.fullname}
//                           className="uploader-avatar"
//                         />
//                       ) : (
//                         <div className="uploader-avatar-placeholder">
//                           {story.uploaded_by_user?.fullname?.charAt(0) || 'U'}
//                         </div>
//                       )}
//                       <span className="uploader-name">
//                         {story.uploaded_by_user?.fullname || 'Unknown User'}
//                       </span>
//                     </div>

//                     <div className="story-date">
//                       {formatDate(story.memory_date || story.createdAt)}
//                     </div>
//                   </div>

//                   {/* Like Button */}
//                   <div className="story-actions">
//                     <button
//                       onClick={() => handleLike(
//                         story._id, 
//                         story.liked_by?.includes(parseInt(localStorage.getItem('userId')))
//                       )}
//                       className={`like-btn ${story.liked_by?.includes(parseInt(localStorage.getItem('userId'))) ? 'liked' : ''}`}
//                     >
//                       ♥ {story.liked_by?.length || 0}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {renderPagination()}
//         </>
//       )}

//       {/* Empty State */}
//       {!loading && stories.length === 0 && (
//         <div className="empty-state">
//           {searchMode ? (
//             <>
//               <h3>No stories found</h3>
//               <p>Try different search terms or clear your search to see all stories.</p>
//               <button onClick={handleClearSearch} className="browse-all-btn">
//                 Browse All Stories
//               </button>
//             </>
//           ) : (
//             <>
//               <h3>No stories yet</h3>
//               <p>Be the first to share a memory with your family!</p>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };


// export default FamilyStoriesSearch;



// src/pages/FamilyStoriesSearch.jsx
// src/pages/FamilyStoriesSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import './FamilyStoriesSearch.css';

const FamilyStoriesSearch = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const limit = 12;

  // Fetch stories based on current mode (search or browse)
  const fetchStories = useCallback(async (page = 1, query = '') => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (query.trim()) {
        // Search mode
        response = await api.get(`/content/${familyId}/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        setSearchMode(true);
      } else {
        // Browse mode - get all stories sorted
        const endpoint = sortOrder === 'asc' ? 'asc' : 'desc';
        response = await api.get(`/content/family/${familyId}/${endpoint}?page=${page}&limit=${limit}`);
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
  }, [familyId, sortOrder]);

  // Initial load and when sort order changes
  useEffect(() => {
    fetchStories(1, searchQuery);
  }, [fetchStories, sortOrder]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
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
    fetchStories(1, '');
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchStories(newPage, searchQuery);
  };

  // Handle like/unlike
  const handleLike = async (storyId, currentlyLiked, e) => {
    e.stopPropagation(); // Prevent navigation when clicking like
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

  return (
    <div className="family-stories-search">
      {/* Header */}
      <div className="search-header">
        <h1>📖 Family Stories</h1>
        <p>Discover and search through your family's precious memories</p>
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
              📚 Browsing all stories - {totalStories} story{totalStories !== 1 ? 's' : ''} total
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
                        story.liked_by?.includes(localStorage.getItem('userId')),
                        e
                      )}
                      className={`like-btn ${story.liked_by?.includes(localStorage.getItem('userId')) ? 'liked' : ''}`}
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
              <h3>No stories yet</h3>
              <p>This family hasn't shared any memories yet.</p>
              <p className="suggestion">Be the first to create a beautiful memory!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FamilyStoriesSearch;