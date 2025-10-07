
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import { Link } from "react-router-dom";
import AddMemberCard from "../../components/family/AddMemberForm";
import AddRootMemberCard from "../../components/family/AddRootMemberForm";
import UpdateFamilyForm from "../../components/family/UpdateFamily";
import RemoveFamilyMembersCard from "../../components/family/RemoveMember";
import DeleteFamilyCard from "../../components/family/DeleteFamilyCard";

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
  Crown,
  Users,
  Calendar,
  Key,
  Home,
  UserPlus,
  UserCog,
  Settings,
  Trash2
} from "lucide-react";

export default function OwnerFamilyPage() {
  const { auth } = useAuth();
  const user = auth?.user;
  const currentUserUserId = user?.user_id;

  const { familyId } = useParams();
  const [familyDetails, setFamilyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComponentName, setSelectedComponentName] = useState("Overview");

  // Infinite scroll states for Overview
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState(null);
  const [sortMode, setSortMode] = useState("desc");

  // Fetch family details
  useEffect(() => {
    if (!familyId) return;

    const fetchFamilyDetails = async () => {
      try {
        const res = await api.get(`/family/${familyId}`);
        setFamilyDetails(res.data.data);
      } catch (err) {
        console.error("Error fetching family details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyDetails();
  }, [familyId]);

  // Fetch stories with infinite scroll
  const fetchStories = useCallback(async () => {
    if (!hasMore && page > 1) return;

    setStoriesLoading(true);
    try {
      const res = await api.get(`/content/family/${familyId}/${sortMode}?page=${page}`);
      const newStories = res?.data?.data?.stories || [];

      setStories(prev => {
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
      setStoriesLoading(false);
    }
  }, [page, hasMore, familyId, sortMode]);

  // Scroll handler
  const handleInfiniteScroll = useCallback(() => {
    if (storiesLoading || !hasMore) return;

    const isBottom = (window.innerHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight;

    if (isBottom) {
      setPage(prev => prev + 1);
    }
  }, [storiesLoading, hasMore]);

  // Data Fetch Effect for stories
  useEffect(() => {
    if (selectedComponentName === "Overview") {
      fetchStories();
    }
  }, [fetchStories, selectedComponentName]);

  // Scroll Listener Effect
  useEffect(() => {
    if (selectedComponentName === "Overview") {
      window.addEventListener("scroll", handleInfiniteScroll);
      return () => window.removeEventListener("scroll", handleInfiniteScroll);
    }
  }, [handleInfiniteScroll, selectedComponentName]);

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

  if (loading) {
    return <div className="p-8 text-center">Loading family details...</div>;
  }

  if (!familyDetails) {
    return <div className="p-8 text-center text-red-500">Family not found.</div>;
  }

  // Dashboard menu with icons
  const menuItems = [
    {
      name: "Overview", component: <OverviewComponent
        stories={stories}
        groupedStories={groupedStories}
        sortMode={sortMode}
        setSortMode={setSortMode}
        storiesLoading={storiesLoading}
        hasMore={hasMore}
        initialLoadError={initialLoadError}
        familyName={familyDetails.family_name}
        currentUserId={currentUserUserId}
      />,
      icon: <Home size={18} />
    },
    { name: "Add New Member", component: <AddMemberCard familyId={familyId} />, icon: <UserPlus size={18} /> },
    { name: "Add Root Member", component: <AddRootMemberCard familyId={familyId} />, icon: <UserCog size={18} /> },
    { name: "Update Family", component: <UpdateFamilyForm familyId={familyId} />, icon: <Settings size={18} /> },
    { name: "Manage Members", component: <RemoveFamilyMembersCard familyId={familyId} />, icon: <Users size={18} /> },
    { name: "Delete Family", component: <DeleteFamilyCard familyId={familyId} />, icon: <Trash2 size={18} /> },
  ];

  const selectedComponent = menuItems.find(
    (item) => item.name === selectedComponentName
  )?.component;

  const { family_name, familyPhoto, maleRoot, femaleRoot, invitation_code, marriage_date, memberships } = familyDetails;

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* LEFT SIDE — Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {selectedComponent}
      </div>

      {/* RIGHT SIDE — Compact Family Info & Management Options */}
      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 shadow-md lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        {/* Family Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-purple-500 shadow-md mb-3">
            <img
              src={familyPhoto || "https://via.placeholder.com/150"}
              alt={family_name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-purple-700 mb-1">
            {family_name}
          </h2>
          <p className="text-gray-500 text-sm">Family Management</p>
        </div>

        {/* Family Details - Compact Grid */}
        <div className="space-y-4 mb-6">
          {/* Male Root */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex-shrink-0">
              <Crown size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-600 mb-1">Male Root</p>
              {maleRoot ? (
                <Link
                  to={`/user/${maleRoot.user_id}`}
                  className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
                >
                  <img
                    src={maleRoot.profilePhoto}
                    alt={maleRoot.fullname}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700 truncate hover:text-purple-600">
                    {maleRoot.fullname}
                  </span>
                </Link>
              ) : (
                <span className="text-sm text-gray-500">N/A</span>
              )}
            </div>
          </div>

          {/* Female Root */}
          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
            <div className="flex-shrink-0">
              <Crown size={16} className="text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-pink-600 mb-1">Female Root</p>
              {femaleRoot ? (
                <div className="flex items-center gap-2">

                  <Link
                    to={`/user/${femaleRoot.user_id}`}
                    className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50">
                    <img
                      src={femaleRoot.profilePhoto}
                      alt={femaleRoot.fullname}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-700 truncate">{femaleRoot.fullname}</span>
                  </Link>

                </div>
              ) : (
                <span className="text-sm text-gray-500">N/A</span>
              )}
            </div>
          </div>

          {/* Marriage Date */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0">
              <Calendar size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 mb-1">Marriage Date</p>
              <p className="text-sm text-gray-700">
                {marriage_date ? new Date(marriage_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Invitation Code */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex-shrink-0">
              <Key size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 mb-1">Invitation Code</p>
              <p className="text-sm font-mono text-purple-600 bg-white px-2 py-1 rounded border">
                {invitation_code}
              </p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        {memberships && memberships.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-700 text-sm">Family Members</h3>
              <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                {memberships.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {memberships.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Link
                    to={`/user/${m.user.user_id}`}
                    className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50">
                    <img
                      src={m.user.profilePhoto || "https://via.placeholder.com/40"}
                      alt={m.user.fullname}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700 truncate">{m.user.fullname}</span>
                  </Link>
                </div>
              ))}
              {memberships.length > 6 && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600">+{memberships.length - 6}</span>
                  </div>
                  <span className="text-xs text-purple-600">More members</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Management Options */}
        <div className="border-t pt-4 border-gray-200">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Manage Family</h3>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = selectedComponentName === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedComponentName(item.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${isActive
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-purple-50 border border-gray-100"
                    }`}
                >
                  <div className={`${isActive ? "text-white" : "text-purple-600"}`}>
                    {item.icon}
                  </div>
                  <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-gray-800"}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               OVERVIEW COMPONENT                           */
/* -------------------------------------------------------------------------- */
const OverviewComponent = ({
  stories,
  groupedStories,
  sortMode,
  setSortMode,
  storiesLoading,
  hasMore,
  initialLoadError,
  familyName,
  currentUserId
}) => {
  // Loading state
  if (storiesLoading && stories.length === 0 && initialLoadError === null) {
    return (
      <div className="text-center py-20 text-xl font-semibold text-purple-600">
        Loading your family stories...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-y-auto">
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
          No memories found for <b>{familyName}</b>.
        </p>
      ) : (
        <div className="max-w-3xl mx-auto">
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
                      familyName={familyName}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Loading indicator for subsequent pages */}
      {storiesLoading && hasMore && (
        <div className="text-center py-4 text-purple-600 font-bold mt-4">
          Loading more memories...
        </div>
      )}

      {/* End of content message */}
      {!hasMore && (
        <div className="text-center py-8 text-gray-500 border-t border-purple-200 mt-6">
          You've reached the end of the timeline! 🎉
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               STORY CARD (SMALLER VERSION)                 */
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
            <Volume2 size={32} className="text-purple-600 mb-3" />
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

          <Link
            to={`/user/${uploader.user_id}`}
            className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
          >
            <img src={uploader.profilePhoto || "https://via.placeholder.com/40"} alt={uploader.fullname} className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-purple-400" />

          </Link>


          <div className="flex flex-col">

            <Link
              to={`/user/${uploader.user_id}`}
              className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
            >
              <p className="font-semibold text-lg text-gray-800 hover:text-purple-600 transition-colors cursor-pointer">{uploader.fullname}</p>
            </Link>



            <p className="text-xs text-gray-500 flex items-center">
              @{uploader.username} • <Clock size={12} className="ml-1 mr-1" /> {timeAgo} • {familyName}
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