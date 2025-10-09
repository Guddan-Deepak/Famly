


// import { Link } from 'react-router-dom'
// import { useEffect, useState, useCallback } from "react";
// import axios from "../../utils/axios";
// import { useAuth } from "../../utils/authContext";
// import AddStory from './AddStory';
// import CreateGroup from './CreateGroup';


// // --- Icons (Using standard SVG for simplicity, replace with Heroicons or similar if available) ---
// const GroupIcon = ({ isSelected }) => (
//     <svg className={`w-5 h-5 mr-3 transition-colors ${isSelected ? 'text-white' : 'text-purple-400'}`} fill="currentColor" viewBox="0 0 20 20">
//         <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 9h2l-2 3h-2l-2-3h2V9z" />
//     </svg>
// );
// const AddStoryIcon = () => (
//     <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//         <path d="M11 3a1 1 0 10-2 0v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V3z" />
//     </svg>
// );
// // Icon for Delete Button
// const DeleteIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
//         <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//     </svg>
// );
// // 🆕 Icon for Leave Group
// const LeaveGroupIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
//         <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
//     </svg>
// );


// // 🆕 New Component: Join Group Form
// const JoinGroupForm = ({ onGroupJoined }) => {
//     const [inviteCode, setInviteCode] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError(null);
//         setSuccess(null);

//         const trimmedCode = inviteCode.trim();
//         if (!trimmedCode) {
//             setError("Invite code cannot be empty.");
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             await axios.post('/private-group/join', {
//                 inviteCode: trimmedCode,
//             });

//             setSuccess("Successfully joined the group!");
//             setInviteCode('');
//             onGroupJoined();

//         } catch (err) {
//             const errorMessage = err.response?.data?.message || 'Failed to join group.';
//             setError(errorMessage);
//             console.error("Join Group Error:", err.response?.data || err.message);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
//             <h3 className="text-lg font-bold mb-3 text-gray-700">Join Private Group</h3>

//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="text"
//                     value={inviteCode}
//                     onChange={(e) => setInviteCode(e.target.value)}
//                     placeholder="Enter Invite Code (e.g., FAM-A8YA4J)"
//                     className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-sm focus:ring-purple-500 focus:border-purple-500"
//                     disabled={isSubmitting}
//                     required
//                 />

//                 {error && (
//                     <p className="text-xs text-red-600 mb-2 p-1 bg-red-50 border border-red-200 rounded-md">
//                         {error}
//                     </p>
//                 )}
//                 {success && (
//                     <p className="text-xs text-green-600 mb-2 p-1 bg-green-50 border border-green-200 rounded-md">
//                         {success}
//                     </p>
//                 )}

//                 <button
//                     type="submit"
//                     className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:bg-purple-300 text-sm"
//                     disabled={isSubmitting || !inviteCode.trim()}
//                 >
//                     {isSubmitting ? 'Joining...' : 'Join Group'}
//                 </button>
//             </form>
//         </div>
//     );
// };


// // --- Main Component ---
// export default function PrivateGroups() {
//     const { auth } = useAuth();
//     // Data states
//     const [groups, setGroups] = useState([]);
//     const [selectedGroup, setSelectedGroup] = useState(null);
//     const [stories, setStories] = useState([]);
//     const [members, setMembers] = useState([]);
//     // UI states
//     const [isLoadingGroups, setIsLoadingGroups] = useState(true);
//     const [isFetchingDetails, setIsFetchingDetails] = useState(false);
//     const [error, setError] = useState(null);
//     // State for managing description expansion in the sidebar
//     const [expandedDescriptions, setExpandedDescriptions] = useState({});
//     // State to toggle the AddStory component/modal
//     const [showAddStoryModal, setShowAddStoryModal] = useState(false);
//     const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

//     // --- NEW STATE: Store the createdBy ID of the selected group for permission checks ---
//     const [selectedGroupOwnerId, setSelectedGroupOwnerId] = useState(null);


//     // --- Core Logic: Fetch Stories and Members ---

//     const fetchGroupDetails = useCallback(async (groupId) => {
//         if (!groupId) return;

//         setSelectedGroup(groupId);
//         setIsFetchingDetails(true);
//         setStories([]);
//         setMembers([]);
//         setError(null);
//         setSelectedGroupOwnerId(null);

//         try {
//             const [storyRes, detailRes] = await Promise.all([
//                 axios.get(`/private-group/${groupId}/stories`),
//                 axios.get(`/private-group/${groupId}`),
//             ]);

//             setStories(storyRes.data?.data?.stories || []);
//             setMembers(detailRes.data?.data?.members || []);

//             // ✅ CAPTURE GROUP OWNER ID HERE
//             const ownerId = detailRes.data?.data?.createdBy;
//             setSelectedGroupOwnerId(ownerId);

//         } catch (err) {
//             console.error("❌ Error fetching group details:", err.response?.data || err.message);
//             setError(`Failed to load data for group ID: ${groupId}.`);
//         } finally {
//             setIsFetchingDetails(false);
//         }
//     }, []);

//     // 🆕 Function to refresh the story feed after a successful story addition/deletion
//     const refreshStoryFeed = useCallback(() => {
//         if (selectedGroup) {
//             fetchGroupDetails(selectedGroup);
//         }
//     }, [selectedGroup, fetchGroupDetails]);

//     // 🆕 Function to refresh the ENTIRE group list and select the first one (used for initial load and after creation/deletion/joining)
//     const reFetchGroupsAndSelectFirst = useCallback(async () => {
//         setIsLoadingGroups(true);
//         try {
//             const res = await axios.get("/private-group/my");
//             const groupsData = res?.data?.data || [];
//             setGroups(groupsData);

//             // Immediately select the first group if the list is not empty
//             if (groupsData.length > 0) {
//                 await fetchGroupDetails(groupsData[0]._id);
//             } else {
//                 // Clear details if no groups exist
//                 setSelectedGroup(null);
//                 setStories([]);
//                 setMembers([]);
//                 setSelectedGroupOwnerId(null);
//             }
//         } catch (err) {
//             console.error("❌ Error refreshing private groups:", err.response?.data || err.message);
//             setError("Failed to fetch your list of private groups.");
//         } finally {
//             setIsLoadingGroups(false);
//         }
//     }, [fetchGroupDetails]);

//     // --- Data Fetching: Groups List (Runs once on mount) ---

//     useEffect(() => {
//         reFetchGroupsAndSelectFirst();
//     }, [reFetchGroupsAndSelectFirst]);

//     // --- Actions ---

//     // 🔑 FIX: This handler is now ONLY responsible for calling fetchGroupDetails.
//     const handleGroupClick = (groupId) => {
//         if (selectedGroup !== groupId) {
//             fetchGroupDetails(groupId);
//         }
//     };

//     // 🆕 Handle Group Deletion API call and UI refresh
//     const handleDeleteGroup = async (groupId, groupName) => {
//         const groupToDeleteName = groupName || groups.find(g => g._id === groupId)?.name || "this group";

//         if (!window.confirm(`Are you sure you want to permanently delete the group "${groupToDeleteName}"? This action cannot be undone.`)) {
//             return;
//         }

//         try {
//             // API route: DELETE /private-group/:groupId
//             await axios.delete(`/private-group/${groupId}`);

//             // Refresh the entire group list and re-select the first one (or clear the view)
//             reFetchGroupsAndSelectFirst();

//         } catch (err) {
//             console.error("❌ Error deleting group:", err.response?.data || err.message);
//             alert("Failed to delete the group. Only the group owner can perform this action.");
//         }
//     };

//     // 🆕 Handle Leave Group API call and UI refresh
//     const handleLeaveGroup = async (groupId, groupName) => {
//         const groupToLeaveName = groupName || groups.find(g => g._id === groupId)?.name || "this group";

//         if (!window.confirm(`Are you sure you want to leave the group "${groupToLeaveName}"? You will need an invite code to rejoin.`)) {
//             return;
//         }

//         try {
//             // API route: DELETE /private-group/:groupId/members/me
//             await axios.delete(`/private-group/${groupId}/members/me`);

//             // Refresh the entire group list and re-select the first one (or clear the view)
//             reFetchGroupsAndSelectFirst();

//         } catch (err) {
//             console.error("❌ Error leaving group:", err.response?.data || err.message);
//             alert("Failed to leave the group. The owner cannot leave; they must delete or transfer ownership.");
//         }
//     };

//     const handleDeleteStory = async (storyId) => {
//         if (!window.confirm("Are you sure you want to delete this story? This cannot be undone.")) return;

//         if (!selectedGroup) {
//             console.error("Cannot delete story: No group selected.");
//             return;
//         }

//         try {
//             await axios.delete(`/private-group/${selectedGroup}/stories/${storyId}`);
//             setStories((prev) => prev.filter((s) => s._id !== storyId));
//         } catch (err) {
//             console.error("❌ Error deleting story:", err.response?.data || err.message);
//             alert("Failed to delete story. You might not have the necessary permissions.");
//         }
//     };

//     // Toggle description expansion in the sidebar
//     const toggleDescription = (groupId) => {
//         setExpandedDescriptions(prev => ({
//             ...prev,
//             [groupId]: !prev[groupId]
//         }));
//     };

//     // Handler to open the AddStory component/modal
//     const handleAddStory = () => {
//         setShowAddStoryModal(true);
//     };

//     // Handler to open the Create Group modal
//     const handleOpenCreateGroup = () => {
//         setShowCreateGroupModal(true);
//     };


//     // --- Render Helpers ---

//     if (isLoadingGroups) {
//         return (
//             <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-2xl text-purple-600 bg-gray-50">
//                 Loading Private Groups... ⏳
//             </div>
//         );
//     }

//     const currentGroupName = groups.find(g => g._id === selectedGroup)?.name;

//     // Determine if the currently logged-in user has permission to delete the story
//     const userHasDeletePermission = (story) => {
//         const currentUserId = auth?.user?.user_id;
//         const storyCreatorId = story.createdBy?.user_id;

//         const isCreator = currentUserId === storyCreatorId;
//         const isGroupOwner = Number(currentUserId) === Number(selectedGroupOwnerId);

//         return isCreator || isGroupOwner;
//     };


//     // --- Render Structure ---

//     return (
//         <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-800">

//             {/* 1. Add Story MODAL */}
//             {showAddStoryModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
//                     <AddStory
//                         privateGroupId={selectedGroup}
//                         onClose={() => setShowAddStoryModal(false)}
//                         onStoryAdded={() => {
//                             setShowAddStoryModal(false);
//                             refreshStoryFeed();
//                         }}
//                     />
//                 </div>
//             )}

//             {/* 2. Create Group MODAL */}
//             {showCreateGroupModal && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
//                     <CreateGroup
//                         onClose={() => setShowCreateGroupModal(false)}
//                         onGroupCreated={() => {
//                             setShowCreateGroupModal(false);
//                             // Refresh the whole group list and auto-select the new one
//                             reFetchGroupsAndSelectFirst();
//                         }}
//                     />
//                 </div>
//             )}

//             {/* 1. Left Sidebar - Group List (20% width) */}
//             <div className={`w-1/5 border-r border-gray-200 p-4 overflow-y-auto bg-white shadow-lg`}>
//                 <h2 className="text-2xl font-bold mb-6 text-purple-700 border-b-2 border-purple-200 pb-3">Private Groups</h2>
//                 <div className="space-y-3">
//                     {groups.length === 0 ? (
//                         <p className="text-sm text-gray-500 p-2 border border-dashed rounded-lg bg-purple-50">No groups found. Create one!</p>
//                     ) : (
//                         groups.map((group) => {
//                             const isSelected = selectedGroup === group._id;
//                             const isDescriptionExpanded = expandedDescriptions[group._id];
//                             const shortDescription = group.description?.substring(0, 70);
//                             const needsExpansion = group.description && group.description.length > 70;

//                             // Check if current user is the group owner
//                             const isGroupOwner = String(group.createdBy) === String(auth?.user?.user_id);

//                             // Check if current user is a member (assumed true if visible, but used to restrict owner from leaving)
//                             const isMember = group.members.some(m => String(m.user_id) === String(auth?.user?.user_id));

//                             return (
//                                 <div
//                                     key={group._id}
//                                     // 🔑 FIX APPLIED: This is the main group selection click area
//                                     onClick={() => handleGroupClick(group._id)}
//                                     className={`cursor-pointer p-3 rounded-xl transition-all duration-200 border-2 ${isSelected
//                                         ? `bg-purple-600 text-white border-purple-600 shadow-xl`
//                                         : `bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-400`
//                                         }`}
//                                 >
//                                     <div className="flex justify-between items-start">
//                                         {/* Group Info Section */}
//                                         <div className="flex items-center mb-1 flex-1 min-w-0 pr-2">
//                                             <GroupIcon isSelected={isSelected} />
//                                             <p className={`font-semibold text-lg truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
//                                                 {group.name}
//                                             </p>
//                                         </div>

//                                         {/* Group Action Buttons (Delete or Leave) */}
//                                         <div className="flex space-x-2 flex-shrink-0">
//                                             {/* 🎯 DELETE BUTTON (Owner Only) */}
//                                             {isGroupOwner && (
//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         handleDeleteGroup(group._id, group.name);
//                                                     }}
//                                                     className={`text-xs p-1 rounded-full transition-colors ${isSelected ? 'bg-purple-800 text-purple-100 hover:bg-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
//                                                     title={`Delete ${group.name}`}
//                                                 >
//                                                     <DeleteIcon />
//                                                 </button>
//                                             )}

//                                             {/* 🎯 LEAVE BUTTON (Member Only - Not owner) */}
//                                             {!isGroupOwner && isMember && (
//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         handleLeaveGroup(group._id, group.name);
//                                                     }}
//                                                     className={`text-xs p-1 rounded-full transition-colors ${isSelected ? 'bg-purple-800 text-purple-100 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-300'}`}
//                                                     title={`Leave ${group.name}`}
//                                                 >
//                                                     <LeaveGroupIcon />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Description and View More Option */}
//                                     {group.description && (
//                                         <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
//                                             {isDescriptionExpanded ? group.description : shortDescription}
//                                             {needsExpansion && (
//                                                 <button
//                                                     onClick={(e) => { e.stopPropagation(); toggleDescription(group._id); }}
//                                                     className={`ml-1 text-xs font-medium underline ${isSelected ? 'text-purple-200 hover:text-white' : 'text-purple-600 hover:text-purple-800'}`}
//                                                 >
//                                                     {isDescriptionExpanded ? 'Less' : 'View More'}
//                                                 </button>
//                                             )}
//                                         </p>
//                                     )}
//                                 </div>
//                             );
//                         })
//                     )}
//                 </div>
//             </div>

//             {/* 2. Middle Section - Stories Feed (55% width) */}
//             <div className="flex-1 p-8 overflow-y-auto bg-purple-50">
//                 <div className="flex justify-between items-center mb-6 border-b-2 border-purple-200 pb-4">
//                     <h2 className="text-3xl font-bold text-purple-800">
//                         Stories
//                         {selectedGroup && <span className="text-gray-600 ml-3">({currentGroupName})</span>}
//                     </h2>
//                     {selectedGroup && (
//                         <button
//                             onClick={handleAddStory}
//                             className="flex items-center px-5 py-2 bg-purple-600 text-white rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-colors"
//                         >
//                             <AddStoryIcon />
//                             Add Story
//                         </button>
//                     )}
//                 </div>

//                 {isFetchingDetails ? (
//                     <div className="text-center p-10 text-xl text-purple-500">Fetching memories... 🔄</div>
//                 ) : stories.length === 0 ? (
//                     <p className="text-gray-600 text-lg p-10 border-4 border-dashed border-purple-300 rounded-2xl mt-10 text-center bg-white shadow-inner">
//                         {selectedGroup ? "Looks quiet here! Share your first memory." : "👈 Select a Private Group to relive memories."}
//                     </p>
//                 ) : (
//                     <div className="space-y-8">
//                         {stories.map((story) => {
//                             const canDeleteStory = userHasDeletePermission(story);

//                             return (
//                                 <div
//                                     key={story._id}
//                                     className="bg-white border border-purple-100 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl"
//                                 >
//                                     {/* Story Header and User Info */}
//                                     <div className="flex justify-between items-start mb-5">
//                                         <div className="flex items-center space-x-3">
//                                             <Link
//                                                 to={`/user/${story.createdBy?.user_id}`}
//                                                 className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
//                                             >
//                                                 <img
//                                                     src={story.createdBy?.profilePhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=👤'}
//                                                     alt={story.createdBy?.fullname || 'User'}
//                                                     className="w-14 h-14 rounded-full object-cover border-4 border-purple-100 shadow-md"
//                                                 />
//                                                 <div>
//                                                     <p className="font-extrabold text-lg text-gray-800">
//                                                         {story.createdBy?.fullname}
//                                                     </p>
//                                                     <p className="text-sm text-purple-500">
//                                                         @{story.createdBy?.username}
//                                                     </p>
//                                                 </div>
//                                             </Link>

//                                         </div>

//                                         {/* Owner Actions */}
//                                         {canDeleteStory && (
//                                             <div className="space-x-3 flex-shrink-0">
//                                                 <button
//                                                     onClick={() => alert(`Editing story: ${story._id}`)}
//                                                     className="text-xs px-4 py-2 border border-purple-300 rounded-full text-purple-600 hover:bg-purple-50 transition-colors font-medium"
//                                                 >
//                                                     Edit 📝
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteStory(story._id)}
//                                                     className={`text-xs px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium shadow-md`}
//                                                 >
//                                                     Delete 🗑️
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Story Content */}
//                                     <div className="mt-4">
//                                         {story.contentType === "text" && (
//                                             <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{story.text}</p>
//                                         )}
//                                         {story.contentType === "image" && (
//                                             <>
//                                                 {story.text && <p className="mb-4 text-base text-gray-700 font-medium">{story.text}</p>}
//                                                 <img
//                                                     src={story.url}
//                                                     alt="story content"
//                                                     className="rounded-xl mt-2 max-h-[500px] w-full object-contain bg-gray-100 shadow-lg border border-gray-200"
//                                                 />
//                                             </>
//                                         )}
//                                         {story.contentType === "video" && (
//                                             <>
//                                                 {story.text && <p className="mb-4 text-base text-gray-700 font-medium">{story.text}</p>}
//                                                 <video
//                                                     controls
//                                                     src={story.url}
//                                                     className="rounded-xl mt-2 w-full max-h-[500px] bg-black shadow-lg"
//                                                 />
//                                             </>
//                                         )}
//                                     </div>

//                                     /* Footer/Timestamp */
//                                     <p className="text-xs text-gray-400 mt-5 text-right italic">
//                                         Posted: {new Date(story.createdAt).toLocaleString()}
//                                     </p>

//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>

//             {/* 3. Right Sidebar - Actions & Members (25% width) */}
//             <div className="w-1/4 border-l border-gray-200 p-6 overflow-y-auto bg-white shadow-lg">
//                 <h2 className="text-2xl font-bold mb-6 text-purple-700 border-b-2 border-purple-200 pb-3">Group Management</h2>

//                 {/* Create Group Button */}
//                 <div className="mb-10 p-5 bg-purple-50 rounded-xl border border-purple-200 shadow-md">
//                     <p className="text-sm font-medium text-purple-800 mb-3">Start a new private group.</p>
//                     <button
//                         className={`w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-300/50`}
//                         onClick={handleOpenCreateGroup}
//                     >
//                         ➕ New Private Group
//                     </button>
//                 </div>

//                 {/* 🆕 JOIN GROUP FORM INTEGRATION */}
//                 <JoinGroupForm onGroupJoined={reFetchGroupsAndSelectFirst} />
//                 {/* 🔚 END JOIN GROUP FORM */}


//                 {/* Members List */}
//                 <h3 className="text-lg font-bold mb-4 text-gray-700 mt-6">
//                     Group Members ({isFetchingDetails ? '...' : members.length})
//                 </h3>
//                 <div className="space-y-3">
//                     {members.length > 0 ? (
//                         members.map((member) => (
//                             <div
//                                 key={member.user_id}
//                                 className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
//                             >
//                                 <Link
//                                     to={`/user/${member.user_id}`}
//                                     className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
//                                 >
//                                     <img
//                                         src={member.profilePhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=👤'}
//                                         alt={member.fullname}
//                                         className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-300 shadow-sm"
//                                     />
//                                     <div className="flex-1 min-w-0">
//                                         <p className="font-semibold text-sm truncate">{member.fullname}</p>
//                                         <p className="text-xs text-gray-500 truncate">@{member.username}</p>
//                                     </div>
//                                 </Link>

//                                 <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full capitalize ${member.role === 'owner' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-200 text-gray-600 border border-gray-300'}`}>
//                                     {member.role}
//                                 </span>
//                             </div>
//                         ))
//                     ) : (
//                         <p className="text-sm text-gray-500">
//                             {selectedGroup ? (isFetchingDetails ? "Loading members..." : "No members found for this group.") : "Select a group to view members."}
//                         </p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// // 🆕 New Component: Join Group Form (Copied from the previous definition)
import { Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from "react";
import axios from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import AddStory from './AddStory';
import CreateGroup from './CreateGroup';

// --- Icons (Using standard SVG for simplicity, replace with Heroicons or similar if available) ---
const GroupIcon = ({ isSelected }) => (
    <svg className={`w-5 h-5 mr-3 transition-colors ${isSelected ? 'text-white' : 'text-purple-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 9h2l-2 3h-2l-2-3h2V9z" />
    </svg>
);
const AddStoryIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11 3a1 1 0 10-2 0v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V3z" />
    </svg>
);
// Icon for Delete Button
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);
// 🆕 Icon for Leave Group
const LeaveGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);
// 🆕 Icon for Copy
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
);

// 🆕 New Component: Join Group Form
const JoinGroupForm = ({ onGroupJoined }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const trimmedCode = inviteCode.trim();
        if (!trimmedCode) {
            setError("Invite code cannot be empty.");
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post('/private-group/join', {
                inviteCode: trimmedCode,
            });

            setSuccess("Successfully joined the group!");
            setInviteCode('');
            onGroupJoined();

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to join group.';
            setError(errorMessage);
            console.error("Join Group Error:", err.response?.data || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-gray-700">Join Private Group</h3>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter Invite Code (e.g., FAM-A8YA4J)"
                    className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-sm focus:ring-purple-500 focus:border-purple-500"
                    disabled={isSubmitting}
                    required
                />

                {error && (
                    <p className="text-xs text-red-600 mb-2 p-1 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-xs text-green-600 mb-2 p-1 bg-green-50 border border-green-200 rounded-md">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:bg-purple-300 text-sm"
                    disabled={isSubmitting || !inviteCode.trim()}
                >
                    {isSubmitting ? 'Joining...' : 'Join Group'}
                </button>
            </form>
        </div>
    );
};

// --- Main Component ---
export default function PrivateGroups() {
    const { auth, isAuthenticated } = useAuth();
    // Data states
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [stories, setStories] = useState([]);
    const [members, setMembers] = useState([]);
    // UI states
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [error, setError] = useState(null);
    // State for managing description expansion in the sidebar
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    // State to toggle the AddStory component/modal
    const [showAddStoryModal, setShowAddStoryModal] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

    // --- NEW STATE: Store the createdBy ID of the selected group for permission checks ---
    const [selectedGroupOwnerId, setSelectedGroupOwnerId] = useState(null);
    // 🆕 NEW STATE: Store invitation code for selected group
    const [selectedGroupInviteCode, setSelectedGroupInviteCode] = useState(null);
    // 🆕 NEW STATE: For copy feedback
    const [copiedCode, setCopiedCode] = useState(null);

    // --- Data Cleanup Function ---
    const clearAllData = useCallback(() => {
        setGroups([]);
        setSelectedGroup(null);
        setStories([]);
        setMembers([]);
        setSelectedGroupOwnerId(null);
        setSelectedGroupInviteCode(null);
        setExpandedDescriptions({});
        setError(null);
        setIsLoadingGroups(true);
        setIsFetchingDetails(false);
    }, []);

    // --- Core Logic: Fetch Stories and Members ---
    const fetchGroupDetails = useCallback(async (groupId) => {
        if (!groupId) return;

        setSelectedGroup(groupId);
        setIsFetchingDetails(true);
        setStories([]);
        setMembers([]);
        setError(null);
        setSelectedGroupOwnerId(null);
        setSelectedGroupInviteCode(null);

        try {
            const [storyRes, detailRes] = await Promise.all([
                axios.get(`/private-group/${groupId}/stories`),
                axios.get(`/private-group/${groupId}`),
            ]);

            setStories(storyRes.data?.data?.stories || []);
            setMembers(detailRes.data?.data?.members || []);

            // ✅ CAPTURE GROUP OWNER ID HERE
            const ownerId = detailRes.data?.data?.createdBy;
            setSelectedGroupOwnerId(ownerId);

            // ✅ CAPTURE INVITATION CODE HERE
            const inviteCode = detailRes.data?.data?.inviteCode;
            setSelectedGroupInviteCode(inviteCode);

        } catch (err) {
            console.error("❌ Error fetching group details:", err.response?.data || err.message);
            setError(`Failed to load data for group ID: ${groupId}.`);
        } finally {
            setIsFetchingDetails(false);
        }
    }, []);

    // 🆕 Function to refresh the story feed after a successful story addition/deletion
    const refreshStoryFeed = useCallback(() => {
        if (selectedGroup) {
            fetchGroupDetails(selectedGroup);
        }
    }, [selectedGroup, fetchGroupDetails]);

    // 🆕 Function to refresh the ENTIRE group list and select the first one
    const reFetchGroupsAndSelectFirst = useCallback(async () => {
        // Clear existing data before fetching new data
        clearAllData();
        
        setIsLoadingGroups(true);
        try {
            const res = await axios.get("/private-group/my");
            const groupsData = res?.data?.data || [];
            setGroups(groupsData);

            // Immediately select the first group if the list is not empty
            if (groupsData.length > 0) {
                await fetchGroupDetails(groupsData[0]._id);
            }
        } catch (err) {
            console.error("❌ Error refreshing private groups:", err.response?.data || err.message);
            setError("Failed to fetch your list of private groups.");
        } finally {
            setIsLoadingGroups(false);
        }
    }, [fetchGroupDetails, clearAllData]);

    // --- Data Fetching: Groups List (Runs on mount and when authentication changes) ---
    useEffect(() => {
        // If user is authenticated, fetch data
        if (isAuthenticated) {
            reFetchGroupsAndSelectFirst();
        } else {
            // If user is not authenticated, clear all data immediately
            clearAllData();
        }
    }, [isAuthenticated, reFetchGroupsAndSelectFirst, clearAllData]);

    // --- Cleanup on unmount ---
    useEffect(() => {
        return () => {
            // Clear data when component unmounts
            clearAllData();
        };
    }, [clearAllData]);

    // 🆕 Function to copy invitation code to clipboard
    const copyInviteCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000); // Clear feedback after 2 seconds
        } catch (err) {
            console.error('Failed to copy invitation code:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    // --- Actions ---
    const handleGroupClick = (groupId) => {
        if (selectedGroup !== groupId) {
            fetchGroupDetails(groupId);
        }
    };

    // 🆕 Handle Group Deletion API call and UI refresh
    const handleDeleteGroup = async (groupId, groupName) => {
        const groupToDeleteName = groupName || groups.find(g => g._id === groupId)?.name || "this group";

        if (!window.confirm(`Are you sure you want to permanently delete the group "${groupToDeleteName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await axios.delete(`/private-group/${groupId}`);
            reFetchGroupsAndSelectFirst();
        } catch (err) {
            console.error("❌ Error deleting group:", err.response?.data || err.message);
            alert("Failed to delete the group. Only the group owner can perform this action.");
        }
    };

    // 🆕 Handle Leave Group API call and UI refresh
    const handleLeaveGroup = async (groupId, groupName) => {
        const groupToLeaveName = groupName || groups.find(g => g._id === groupId)?.name || "this group";

        if (!window.confirm(`Are you sure you want to leave the group "${groupToLeaveName}"? You will need an invite code to rejoin.`)) {
            return;
        }

        try {
            await axios.delete(`/private-group/${groupId}/members/me`);
            reFetchGroupsAndSelectFirst();
        } catch (err) {
            console.error("❌ Error leaving group:", err.response?.data || err.message);
            alert("Failed to leave the group. The owner cannot leave; they must delete or transfer ownership.");
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm("Are you sure you want to delete this story? This cannot be undone.")) return;

        if (!selectedGroup) {
            console.error("Cannot delete story: No group selected.");
            return;
        }

        try {
            await axios.delete(`/private-group/${selectedGroup}/stories/${storyId}`);
            setStories((prev) => prev.filter((s) => s._id !== storyId));
        } catch (err) {
            console.error("❌ Error deleting story:", err.response?.data || err.message);
            alert("Failed to delete story. You might not have the necessary permissions.");
        }
    };

    // Toggle description expansion in the sidebar
    const toggleDescription = (groupId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Handler to open the AddStory component/modal
    const handleAddStory = () => {
        setShowAddStoryModal(true);
    };

    // Handler to open the Create Group modal
    const handleOpenCreateGroup = () => {
        setShowCreateGroupModal(true);
    };

    // --- Render Helpers ---
    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-2xl text-purple-600 bg-gray-50">
                Redirecting to authentication...
            </div>
        );
    }

    if (isLoadingGroups) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-2xl text-purple-600 bg-gray-50">
                Loading Private Groups... ⏳
            </div>
        );
    }

    const currentGroupName = groups.find(g => g._id === selectedGroup)?.name;

    // Determine if the currently logged-in user has permission to delete the story
    const userHasDeletePermission = (story) => {
        const currentUserId = auth?.user?.user_id;
        const storyCreatorId = story.createdBy?.user_id;

        const isCreator = currentUserId === storyCreatorId;
        const isGroupOwner = Number(currentUserId) === Number(selectedGroupOwnerId);

        return isCreator || isGroupOwner;
    };

    // --- Render Structure ---
    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100 text-gray-800">
            {/* 1. Add Story MODAL */}
            {showAddStoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <AddStory
                        privateGroupId={selectedGroup}
                        onClose={() => setShowAddStoryModal(false)}
                        onStoryAdded={() => {
                            setShowAddStoryModal(false);
                            refreshStoryFeed();
                        }}
                    />
                </div>
            )}

            {/* 2. Create Group MODAL */}
            {showCreateGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <CreateGroup
                        onClose={() => setShowCreateGroupModal(false)}
                        onGroupCreated={() => {
                            setShowCreateGroupModal(false);
                            reFetchGroupsAndSelectFirst();
                        }}
                    />
                </div>
            )}

            {/* 1. Left Sidebar - Group List (20% width) */}
            <div className={`w-1/5 border-r border-gray-200 p-4 overflow-y-auto bg-white shadow-lg`}>
                <h2 className="text-2xl font-bold mb-6 text-purple-700 border-b-2 border-purple-200 pb-3">Private Groups</h2>
                <div className="space-y-3">
                    {groups.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2 border border-dashed rounded-lg bg-purple-50">No groups found. Create one!</p>
                    ) : (
                        groups.map((group) => {
                            const isSelected = selectedGroup === group._id;
                            const isDescriptionExpanded = expandedDescriptions[group._id];
                            const shortDescription = group.description?.substring(0, 70);
                            const needsExpansion = group.description && group.description.length > 70;

                            // Check if current user is the group owner
                            const isGroupOwner = String(group.createdBy) === String(auth?.user?.user_id);

                            // Check if current user is a member (assumed true if visible, but used to restrict owner from leaving)
                            const isMember = group.members.some(m => String(m.user_id) === String(auth?.user?.user_id));

                            return (
                                <div
                                    key={group._id}
                                    onClick={() => handleGroupClick(group._id)}
                                    className={`cursor-pointer p-3 rounded-xl transition-all duration-200 border-2 ${isSelected
                                        ? `bg-purple-600 text-white border-purple-600 shadow-xl`
                                        : `bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-400`
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        {/* Group Info Section */}
                                        <div className="flex items-center mb-1 flex-1 min-w-0 pr-2">
                                            <GroupIcon isSelected={isSelected} />
                                            <p className={`font-semibold text-lg truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                                {group.name}
                                            </p>
                                        </div>

                                        {/* Group Action Buttons (Delete or Leave) */}
                                        <div className="flex space-x-2 flex-shrink-0">
                                            {/* 🎯 DELETE BUTTON (Owner Only) */}
                                            {isGroupOwner && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroup(group._id, group.name);
                                                    }}
                                                    className={`text-xs p-1 rounded-full transition-colors ${isSelected ? 'bg-purple-800 text-purple-100 hover:bg-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                    title={`Delete ${group.name}`}
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            )}

                                            {/* 🎯 LEAVE BUTTON (Member Only - Not owner) */}
                                            {!isGroupOwner && isMember && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLeaveGroup(group._id, group.name);
                                                    }}
                                                    className={`text-xs p-1 rounded-full transition-colors ${isSelected ? 'bg-purple-800 text-purple-100 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-300'}`}
                                                    title={`Leave ${group.name}`}
                                                >
                                                    <LeaveGroupIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description and View More Option */}
                                    {group.description && (
                                        <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                                            {isDescriptionExpanded ? group.description : shortDescription}
                                            {needsExpansion && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleDescription(group._id); }}
                                                    className={`ml-1 text-xs font-medium underline ${isSelected ? 'text-purple-200 hover:text-white' : 'text-purple-600 hover:text-purple-800'}`}
                                                >
                                                    {isDescriptionExpanded ? 'Less' : 'View More'}
                                                </button>
                                            )}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 2. Middle Section - Stories Feed (55% width) */}
            <div className="flex-1 p-8 overflow-y-auto bg-purple-50">
                <div className="flex justify-between items-center mb-6 border-b-2 border-purple-200 pb-4">
                    <h2 className="text-3xl font-bold text-purple-800">
                        Stories
                        {selectedGroup && <span className="text-gray-600 ml-3">({currentGroupName})</span>}
                    </h2>
                    {selectedGroup && (
                        <button
                            onClick={handleAddStory}
                            className="flex items-center px-5 py-2 bg-purple-600 text-white rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-colors"
                        >
                            <AddStoryIcon />
                            Add Story
                        </button>
                    )}
                </div>

                {isFetchingDetails ? (
                    <div className="text-center p-10 text-xl text-purple-500">Fetching memories... 🔄</div>
                ) : stories.length === 0 ? (
                    <p className="text-gray-600 text-lg p-10 border-4 border-dashed border-purple-300 rounded-2xl mt-10 text-center bg-white shadow-inner">
                        {selectedGroup ? "Looks quiet here! Share your first memory." : "👈 Select a Private Group to relive memories."}
                    </p>
                ) : (
                    <div className="space-y-8">
                        {stories.map((story) => {
                            const canDeleteStory = userHasDeletePermission(story);

                            return (
                                <div
                                    key={story._id}
                                    className="bg-white border border-purple-100 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl"
                                >
                                    {/* Story Header and User Info */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                to={`/user/${story.createdBy?.user_id}`}
                                                className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
                                            >
                                                <img
                                                    src={story.createdBy?.profilePhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=👤'}
                                                    alt={story.createdBy?.fullname || 'User'}
                                                    className="w-14 h-14 rounded-full object-cover border-4 border-purple-100 shadow-md"
                                                />
                                                <div>
                                                    <p className="font-extrabold text-lg text-gray-800">
                                                        {story.createdBy?.fullname}
                                                    </p>
                                                    <p className="text-sm text-purple-500">
                                                        @{story.createdBy?.username}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Owner Actions */}
                                        {canDeleteStory && (
                                            <div className="space-x-3 flex-shrink-0">
                                                <button
                                                    onClick={() => alert(`Editing story: ${story._id}`)}
                                                    className="text-xs px-4 py-2 border border-purple-300 rounded-full text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                                                >
                                                    Edit 📝
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStory(story._id)}
                                                    className={`text-xs px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium shadow-md`}
                                                >
                                                    Delete 🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Story Content */}
                                    <div className="mt-4">
                                        {story.contentType === "text" && (
                                            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{story.text}</p>
                                        )}
                                        {story.contentType === "image" && (
                                            <>
                                                {story.text && <p className="mb-4 text-base text-gray-700 font-medium">{story.text}</p>}
                                                <img
                                                    src={story.url}
                                                    alt="story content"
                                                    className="rounded-xl mt-2 max-h-[500px] w-full object-contain bg-gray-100 shadow-lg border border-gray-200"
                                                />
                                            </>
                                        )}
                                        {story.contentType === "video" && (
                                            <>
                                                {story.text && <p className="mb-4 text-base text-gray-700 font-medium">{story.text}</p>}
                                                <video
                                                    controls
                                                    src={story.url}
                                                    className="rounded-xl mt-2 w-full max-h-[500px] bg-black shadow-lg"
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Footer/Timestamp */}
                                    <p className="text-xs text-gray-400 mt-5 text-right italic">
                                        Posted: {new Date(story.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 3. Right Sidebar - Actions & Members (25% width) */}
            <div className="w-1/4 border-l border-gray-200 p-6 overflow-y-auto bg-white shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-purple-700 border-b-2 border-purple-200 pb-3">Group Management</h2>

                {/* Create Group Button */}
                <div className="mb-10 p-5 bg-purple-50 rounded-xl border border-purple-200 shadow-md">
                    <p className="text-sm font-medium text-purple-800 mb-3">Start a new private group.</p>
                    <button
                        className={`w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-300/50`}
                        onClick={handleOpenCreateGroup}
                    >
                        ➕ New Private Group
                    </button>
                </div>

                {/* 🆕 JOIN GROUP FORM INTEGRATION */}
                <JoinGroupForm onGroupJoined={reFetchGroupsAndSelectFirst} />

                {/* 🆕 INVITATION CODE SECTION */}
                {selectedGroup && selectedGroupInviteCode && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-md">
                        <h3 className="text-lg font-bold mb-3 text-purple-700">Group Invitation Code</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-300 shadow-sm">
                            <code className="text-sm font-mono text-purple-800 font-bold">
                                {selectedGroupInviteCode}
                            </code>
                            <button
                                onClick={() => copyInviteCode(selectedGroupInviteCode)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    copiedCode === selectedGroupInviteCode
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300'
                                }`}
                            >
                                <CopyIcon />
                                {copiedCode === selectedGroupInviteCode ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                            Share this code with family members to invite them to this private group.
                        </p>
                    </div>
                )}

                {/* Members List */}
                <h3 className="text-lg font-bold mb-4 text-gray-700 mt-6">
                    Group Members ({isFetchingDetails ? '...' : members.length})
                </h3>
                <div className="space-y-3">
                    {members.length > 0 ? (
                        members.map((member) => (
                            <div
                                key={member.user_id}
                                className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <Link
                                    to={`/user/${member.user_id}`}
                                    className="flex items-center gap-2 p-1 rounded-md transition-transform duration-200 hover:scale-105 hover:bg-gray-50"
                                >
                                    <img
                                        src={member.profilePhoto || 'https://via.placeholder.com/150/EEEEEE/808080?text=👤'}
                                        alt={member.fullname}
                                        className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-purple-300 shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{member.fullname}</p>
                                        <p className="text-xs text-gray-500 truncate">@{member.username}</p>
                                    </div>
                                </Link>

                                <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full capitalize ${member.role === 'owner' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-gray-200 text-gray-600 border border-gray-300'}`}>
                                    {member.role}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            {selectedGroup ? (isFetchingDetails ? "Loading members..." : "No members found for this group.") : "Select a group to view members."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}