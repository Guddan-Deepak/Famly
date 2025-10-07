

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import { useNavigate } from "react-router-dom";
import AddMemory from "../../components/DashboardComponents/AddMemory";

// Assume AddMemory component is located here.

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Film,
  Image as ImageIcon,
  FileText,
  Clock,
  Send,
  PlusCircle, // <--- ADDED ICON
  X, // <--- ADDED ICON
} from "lucide-react";


export default function MemberFamilyPage() {
  const { familyId } = useParams();
  const { auth } = useAuth();
  const currentUserId = auth?.user?.user_id;
  const navigate = useNavigate();
  
  // Infinite scroll states (EXACTLY like home.jsx)
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);
  
  const [sortMode, setSortMode] = useState("desc");
  const [error, setError] = useState(null);
  const [familyDetails, setFamilyDetails] = useState(null);

  // NEW STATE for Modal
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- ADDED STATE

  // Function to reset stories and start over for sorting/new memory
  const resetAndFetchStories = useCallback((newSortMode) => {
    setStories([]);
    setPage(1);
    setHasMore(true);
    // If the sort mode is changing, update it, which triggers a new fetch via useEffect
    setSortMode(newSortMode || sortMode); 
    // If not changing sortMode, force a fetch if we are already at page 1
    if (page === 1) fetchStories();
  }, [sortMode, page]); // Dependency added: fetchStories is needed here

  // Fetch family details
  const fetchFamilyDetails = useCallback(async () => {
    try {
      const res = await api.get(`/family/${familyId}`);
      setFamilyDetails(res.data.data);
    } catch (err) {
      console.error("Error fetching family:", err);
      setError("Failed to load family info.");
    }
  }, [familyId]);

  // Fetch stories with infinite scroll (EXACTLY like home.jsx)
  const fetchStories = useCallback(async () => {
    if (!hasMore && page > 1) return;
    
    setLoading(true); 
    try {
      const res = await api.get(`/content/family/${familyId}/${sortMode}?page=${page}`);
      const newStories = res?.data?.data?.stories || [];

      setStories(prev => {
        // Handle page 1 reset when sorting changes
        if (page === 1) return newStories;
        
        const newStoryIds = new Set(prev.map(s => s._id));
        const filteredNewStories = newStories.filter(s => !newStoryIds.has(s._id));
        return [...prev, ...filteredNewStories];
      });

      if (newStories.length === 0) {
        setHasMore(false);
      }
      
      if (page === 1 && newStories.length === 0) {
           setInitialLoadError("No stories yet. Start preserving your memories!");
      } else {
           setInitialLoadError(null);
      }
      
    } catch (err) {
      console.error("Story Feed Fetch Error:", err);
      if (page === 1) {
        setInitialLoadError("Failed to load stories. Please check your network or try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, familyId, sortMode]);

  // Scroll handler (EXACTLY like home.jsx)
  const handleInfiniteScroll = useCallback(() => {
    if (loading || !hasMore || isModalOpen) return; // Prevent scroll fetch if modal is open

    const isBottom = (window.innerHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight;
    
    if (isBottom) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore, isModalOpen]); // isModalOpen added as dependency

  // Initial Load / Authentication Effect (EXACTLY like home.jsx)
  useEffect(() => {
    if (!auth?.accessToken && stories.length > 0) {
      // Reset feed if logged out
      setStories([]);
      setPage(1);
      setLoading(true);
      setHasMore(true);
      setInitialLoadError(null);
    } else if (auth?.accessToken && stories.length === 0 && page === 1 && !loading) {
      fetchStories();
    }
  }, [auth, stories.length, loading, page, fetchStories]);
  
  // Data Fetch Effect (EXACTLY like home.jsx)
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Scroll Listener Effect (EXACTLY like home.jsx)
  useEffect(() => {
    window.addEventListener("scroll", handleInfiniteScroll);
    return () => window.removeEventListener("scroll", handleInfiniteScroll);
  }, [handleInfiniteScroll]);

  useEffect(() => {
    fetchFamilyDetails();
  }, [fetchFamilyDetails]);
  
  // Effect for Sort Mode change
  useEffect(() => {
    // When sortMode changes, reset state and fetch from page 1
    if (page === 1 && stories.length > 0) {
        // If we are already on page 1, a sortMode change should force a refetch
        fetchStories();
    } else if (stories.length > 0) {
        // If we change sort mode while being deep in pages, reset to page 1
        setStories([]);
        setPage(1);
        setHasMore(true);
        // fetchStories will be called when page becomes 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortMode]);

  const groupByYear = (stories) => {
    const groups = {};
    stories.forEach((story) => {
      const date = new Date(story.memory_date || story.createdAt);
      const year = date.getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(story);
    });
    return groups;
  };

  const groupedStories = useMemo(() => groupByYear(stories), [stories]);

  // Loading state (EXACTLY like home.jsx)
  if (loading && stories.length === 0 && initialLoadError === null) {
    return (
      <div className="text-center py-20 text-xl font-semibold text-purple-600">
        Loading your family stories...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-6">{error}</div>;
  }

  if (!familyDetails) {
    return <div className="text-center text-gray-600 p-6">Family not found.</div>;
  }

  const {
    family_name,
    familyPhoto,
    maleRoot,
    femaleRoot,
    invitation_code,
    marriage_date,
    description,
    memberships,
  } = familyDetails;

  // Exclude root members
  const memberList = memberships
    ?.map((m) => m.user)
    .filter(
      (u) =>
        u.user_id !== maleRoot?.user_id &&
        u.user_id !== femaleRoot?.user_id
    );

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* LEFT SIDE — Timeline */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Family Beautiful Memories</h2>

          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "desc"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
                } hover:bg-purple-100`}
              onClick={() => setSortMode("desc")}
            >
              Show by Recent
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${sortMode === "asc"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
                } hover:bg-purple-100`}
              onClick={() => setSortMode("asc")}
            >
              Show by Memory Date
            </button>
          </div>
        </div>

        {/* TIMELINE */}
        {Object.keys(groupedStories).length === 0 ? (
          <p className="text-gray-600 text-center mt-10">
            No memories found for <b>{family_name}</b>.
          </p>
        ) : (
          <div className="max-w-3xl mx-auto"> {/* Reduced max width for smaller cards */}
            {Object.entries(groupedStories)
              .sort((a, b) => (sortMode === "asc" ? a[0] - b[0] : b[0] - a[0]))
              .map(([year, yearStories]) => (
                <div key={year} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-3 text-gray-800">
                    {year}
                  </h3>
                  <div className="space-y-4">
                    {yearStories.map((story) => (
                      <StoryCard
                        key={story._id}
                        story={story}
                        currentUserId={currentUserId}
                        familyName={family_name}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Loading indicator for subsequent pages (EXACTLY like home.jsx) */}
        {loading && hasMore && (
          <div className="text-center py-4 text-purple-600 font-bold mt-4">
            Loading more memories...
          </div>
        )}

        {/* End of content message (EXACTLY like home.jsx) */}
        {!hasMore && (
          <div className="text-center py-8 text-gray-500 border-t border-purple-200 mt-6">
            You've reached the end of the timeline! 🎉
          </div>
        )}
      </div>

      {/* RIGHT SIDE — Family Info (FIXED SIDEBAR) */}
      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 shadow-md lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-purple-500 shadow-md">
            <img
              src={familyPhoto || "https://via.placeholder.com/150"}
              alt={family_name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-purple-700">
            {family_name}
          </h2>
          <p className="text-gray-600 text-sm">{description || "Family Circle"}</p>
        </div>

        {/* NEW: Add Memory Button */}
        <button
          onClick={() => setIsModalOpen(true)} // <--- Set state to open modal
          className="w-full mb-6 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-[1.02]"
        >
          <PlusCircle size={20} />
          <span>Add New Memory</span>
        </button>


        <div className="space-y-3 text-sm text-gray-700 mb-4">
          <p>
            👑 <span className="font-semibold">Male Root:</span>{" "}
            {maleRoot ? (
              <span className="flex items-center gap-2">
                <img
                  src={maleRoot.profilePhoto}
                  alt={maleRoot.fullname}
                  className="w-6 h-6 rounded-full object-cover"
                />{" "}
                {maleRoot.fullname}
              </span>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            👑 <span className="font-semibold">Female Root:</span>{" "}
            {femaleRoot ? (
              <span className="flex items-center gap-2">
                <img
                  src={femaleRoot.profilePhoto}
                  alt={femaleRoot.fullname}
                  className="w-6 h-6 rounded-full object-cover"
                />{" "}
                {femaleRoot.fullname}
              </span>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            💍 <span className="font-semibold">Marriage Date:</span>{" "}
            {marriage_date ? new Date(marriage_date).toLocaleDateString() : "N/A"}
          </p>
          <p>
            🔐 <span className="font-semibold">Invitation Code:</span>{" "}
            <span className="text-purple-600 font-mono">{invitation_code}</span>
          </p>
        </div>

        {memberList && memberList.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Members:</h3>
            <div className="flex flex-wrap gap-3">
              {memberList.map((m) => (
                <div key={m.user_id} className="flex items-center gap-2">
                  <img
                    src={m.profilePhoto || "https://via.placeholder.com/40"}
                    alt={m.fullname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700 text-sm">{m.fullname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

       <button
  onClick={async () => {
    if (!window.confirm("Are you sure you want to leave this family?")) return;
    try {
      await api.post(`/family/leave-family/${familyId}`);
      alert("You have left the family successfully.");
      navigate("/dashboard")
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to leave the family");
    }
  }}
  className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
>
  Leave Family
</button>
      </aside>

      {/* NEW: MODAL/POPUP FOR ADD MEMORY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-xl shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)} // <--- Close modal
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* AddMemory Component */}
            <AddMemory 
              familyId={familyId} 
              onClose={() => setIsModalOpen(false)}
              onMemoryAdded={() => resetAndFetchStories(sortMode)} // Refresh stories on success
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               STORY CARD (SMALLER VERSION)                 */
/* -------------------------------------------------------------------------- */
const StoryCard = React.memo(({ story, currentUserId, familyName }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [likes, setLikes] = useState(story.liked_by.length);
  const [isLiked, setIsLiked] = useState(story.liked_by.includes(currentUserId));

  const currentMedia = story.media[currentMediaIndex];
  const totalMedia = story.media.length;
  

  const uploader = story.uploaded_by || {
    fullname: "Unknown User",
    username: "unknown_user",
    profilePhoto: "https://via.placeholder.com/40" 
  };

  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(story.createdAt).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `less than a minute ago`;
  }, [story.createdAt]);

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    const endpoint = isLiked ? `/unlike/${story._id}` : `/like/${story._id}`;
    
    setIsLiked(prev => !prev);
    setLikes(prev => prev + (isLiked ? -1 : 1));

    try {
      await api.post(endpoint); 
    } catch (err) {
      console.error("Like toggle failed:", err);
      setIsLiked(prev => !prev);
      setLikes(prev => prev - (isLiked ? -1 : 1));
    }
  };
  
  const renderMedia = (mediaItem) => {
    if (!mediaItem) return null;
    switch (mediaItem.type) {
      case "image":
        return <img src={mediaItem.url} alt="Story Media" className="w-full h-full object-cover" />;
      case "video":
        return (
          <div className="relative w-full h-full bg-black">
            <video 
              src={mediaItem.url} 
              className="w-full h-full object-contain"
              controls 
              poster={mediaItem.thumbnailUrl}
            />
          </div>
        );
      case "audio":
        return (
          <div className="flex flex-col items-center justify-center min-h-[150px] bg-purple-100/50 rounded-lg p-4 border border-purple-200">
            <Volume2 size={32} className="text-purple-600 mb-3"/>
            <p className="text-gray-700 font-medium mb-2">Audio Memory</p>
            <audio controls className="w-full max-w-xs">
              <source src={mediaItem.url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "text":
        return <div className="p-6 bg-purple-50 min-h-[200px] flex flex-col justify-center rounded-lg text-gray-700 border border-purple-200">
          <p className="font-medium text-lg mb-2 whitespace-pre-wrap leading-relaxed">{mediaItem.text}</p>
          <FileText size={20} className="text-purple-400 mt-4 self-end" />
        </div>;
      default:
        return null;
    }
  };

  const goToNext = (e) => {
    e.preventDefault();
    setCurrentMediaIndex(prev => (prev + 1) % totalMedia);
  };

  const goToPrev = (e) => {
    e.preventDefault();
    setCurrentMediaIndex(prev => (prev - 1 + totalMedia) % totalMedia);
  };
  
  const cleanedTags = (story.tags || []).map(tag => tag.replace(/[\[\]"]/g, '')).filter(t => t.length > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 mb-6 w-full transition-shadow duration-300 hover:shadow-xl">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center">
          <img src={uploader.profilePhoto || "https://via.placeholder.com/40"} alt={uploader.fullname} className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-purple-400" />
          <div className="flex flex-col">
            <p className="font-semibold text-lg text-gray-800 hover:text-purple-600 transition-colors cursor-pointer">{uploader.fullname}</p>
            <p className="text-xs text-gray-500 flex items-center">
              @{uploader.username} • <Clock size={12} className="ml-1 mr-1"/> {timeAgo} • {familyName}
            </p>
          </div>
        </div>
        <MoreVertical size={20} className="text-gray-500 hover:text-purple-600 cursor-pointer transition-colors" />
      </div>

      {/* Title & Caption */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-purple-700 mb-2 flex items-center space-x-2">
          <div className="flex-shrink-0 text-purple-500">
            {currentMedia?.type === 'image' && <ImageIcon size={20} />}
            {currentMedia?.type === 'video' && <Film size={20} />}
            {currentMedia?.type === 'audio' && <Volume2 size={20} />}
            {currentMedia?.type === 'text' && <FileText size={20} />}
          </div>
          <span>{story.title}</span>
</h3>
        
        <p className="text-gray-600 text-base leading-relaxed">{story.caption}</p>
      </div>

      {/* Media/Content Area */}
      <div className="mb-4">
        <div className={`relative w-full ${currentMedia?.type !== 'text' && currentMedia?.type !== 'audio' ? 'aspect-video' : ''} rounded-lg overflow-hidden shadow-inner bg-gray-100/50`}>
          {renderMedia(currentMedia)}
          
          {/* Carousel Controls */}
          {totalMedia > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 opacity-90 disabled:opacity-30"
                disabled={currentMediaIndex === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-all z-10 opacity-90 disabled:opacity-30"
                disabled={currentMediaIndex === totalMedia - 1}
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold z-10">
                {currentMediaIndex + 1} of {totalMedia}
              </div>
            </>
          )}
        </div>
        </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {cleanedTags.map((tag, i) => (
          <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer">
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4 border-gray-100">
        <div className="flex space-x-6">
          <button onClick={handleLikeToggle} className={`flex items-center font-semibold text-sm transition-colors transform hover:scale-105 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="mr-1" /> {likes} Likes
          </button>
          <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors font-semibold text-sm transform hover:scale-105">
            <MessageCircle size={18} className="mr-1" /> 0 Comments
          </button>
          <button className="flex items-center text-gray-500 hover:text-purple-600 transition-colors font-semibold text-sm transform hover:scale-105">
            <Send size={18} className="mr-1" /> Share
          </button>
        </div>
        <Bookmark size={18} className="text-gray-500 hover:text-purple-600 cursor-pointer transition-colors" />
      </div>
    </div>
  );
});

