import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/axios";
import TimelineCard from "../../components/TimelineComponent/TimelineCard";
import { useAuth } from "../../utils/authContext"; 

export default function TimelinePage() {
    const { auth } = useAuth();
    const currentUserId = auth?.user?.user_id;

    const [stories, setStories] = useState([]);
    const [allFamilies, setAllFamilies] = useState([]); 
    const [selectedFamilyId, setSelectedFamilyId] = useState(null);
    const [sortMode, setSortMode] = useState("desc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFamilyList = useCallback(async () => {
        if (!currentUserId) {
            setError("User data not available. Please log in.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setAllFamilies([]);
        setSelectedFamilyId(null);

        try {
            const profileRes = await api.get(`/user/${currentUserId}/profile`);
            const families = profileRes.data.data.families || [];

            if (families.length > 0) {
                setAllFamilies(families);
                
                const adminFamily = families.find(fam => fam.Membership?.role === 'admin');
                const defaultFamilyId = adminFamily
                    ? adminFamily.family_id
                    : families[0].family_id;

                setSelectedFamilyId(defaultFamilyId);
                
            } else {
                setError("NO_FAMILY_MEMBERSHIP"); 
            }
        } catch (err) {
            console.error("Failed to load user profile:", err);
            setError("Failed to fetch user family data.");
        } finally {
            if (!selectedFamilyId) setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchFamilyList();
    }, [fetchFamilyList]);

    const fetchStories = useCallback(async () => {
        if (!selectedFamilyId) {
            setStories([]);
            return; 
        }

        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/content/family/${selectedFamilyId}/${sortMode}`);
            setStories(res.data.data.stories || []);
        } catch (error) {
            console.error("Failed to load stories", error);
            setError("Failed to load timeline stories for the selected family.");
            setStories([]);
        } finally {
            setLoading(false);
        }
    }, [selectedFamilyId, sortMode]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

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

    const groupedStories = groupByYear(stories);

    const handleFamilyChange = (e) => {
        setSelectedFamilyId(e.target.value);
        setStories([]); 
        setLoading(true);
    };

    if (loading && allFamilies.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-xl text-purple-600">Initializing timeline and fetching families...</p>
            </div>
        );
    }
    
    if (error === "NO_FAMILY_MEMBERSHIP") {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">No Family Circles Found</h2>
                <p className="text-lg text-gray-700 mb-6">
                    You are not currently a member of any family circle. Please **create one or accept an invitation** to view a timeline.
                </p>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors">
                    Create New Family Circle
                </button>
            </div>
        );
    }

    const currentFamilyName = allFamilies.find(f => f.family_id === selectedFamilyId)?.family_name || 'Selected Family';

    return (
        <div className="p-0 md:p-2 lg:p-0">
            
            {/* Header: Uses flex-col on mobile, then flex-row on larger screens */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Family Timeline</h2>
                
                {/* --- CONTROLS FIX START --- */}
                {/* Main Controls Wrapper: flex-col on mobile, using gap-3 for separation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto flex-shrink-0">
                    
                    {/* Family Selector Dropdown: Fixed width on larger screens, full width on mobile */}
                    {allFamilies.length > 0 && (
                        <select
                            value={selectedFamilyId || ''}
                            onChange={handleFamilyChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800 font-semibold w-full sm:w-64 flex-shrink-0"
                        >
                            {allFamilies.map(fam => (
                                <option key={fam.family_id} value={fam.family_id}>
                                    {fam.family_name} {fam.Membership?.role === 'admin' ? ' (Admin)' : ''}
                                </option>
                            ))}
                        </select>
                    )}
                    
                    {/* Sorting Buttons: Always stack vertically on all but the smallest screens */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                        <button
                            className={`px-3 sm:px-4 py-2 w-full rounded-lg font-semibold text-sm transition-colors ${
                                sortMode === "desc" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"
                            } hover:shadow-md hover:bg-purple-100`}
                            onClick={() => setSortMode("desc")}
                        >
                            Show by Recent
                        </button>
                        <button
                            className={`px-3 sm:px-4 py-2 w-full rounded-lg font-semibold text-sm transition-colors ${
                                sortMode === "asc" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"
                            } hover:shadow-md hover:bg-purple-100`}
                            onClick={() => setSortMode("asc")}
                        >
                            Show by Memory Date
                        </button>
                    </div>
                </div>
                {/* --- CONTROLS FIX END --- */}
            </div>

            {loading && selectedFamilyId ? (
                <p className="text-lg text-purple-600 mt-10">Loading stories for **{currentFamilyName}**...</p>
            ) : Object.keys(groupedStories).length === 0 ? (
                <p className="text-lg text-gray-600 mt-10">No memories found in **{currentFamilyName}** for this view.</p>
            ) : (
                <div className="max-w-full md:max-w-2xl lg:max-w-4xl mx-auto">
                    {Object.entries(groupedStories)
                        .sort((a, b) => (sortMode === "asc" ? a[0] - b[0] : b[0] - a[0]))
                        .map(([year, yearStories]) => (
                            <div key={year} className="mb-10">
                                <h3 className="text-xl font-semibold mb-4 border-l-4 border-purple-500 pl-2">
                                    {year}
                                </h3>
                                <div className="space-y-6">
                                    {yearStories.map((story, index) => (
                                        <TimelineCard 
                                            key={story._id} 
                                            story={story} 
                                            isFirst={index === 0}
                                            isLast={index === yearStories.length - 1}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}
