import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/authContext";

// Import icons for the sidebar
import { Home, Users, PlusCircle, Clock, TreePalm, Search, BookText, Brain, Link, Download, Bell, Menu, X } from "lucide-react"; // Added Menu and X icons


import AddMemory from "../../components/DashboardComponents/AddMemory";
import FamilyTree from "../../components/DashboardComponents/FamilyTree";
import SearchComponent from "../../components/DashboardComponents/Search";
import Overview from "../../components/DashboardComponents/Overview";
import TimelinePage from "../family/TimelinePage"; // Assuming this is correct
import FamilyPDFGenerator from "../../components/DashboardComponents/PdfGenerator";
import CreateNotification from "../../components/DashboardComponents/Notification";

// 1. Refactored menuItems with Icons and Subtitles
const menuItems = [
    { name: "Overview", icon: <Home size={20} />, subtitle: "Go-to-ward home", component: <Overview /> },
    // { name: "Add Memory", icon: <PlusCircle size={20} />, subtitle: "Upload stories & media", component: <AddMemory familyId={2}/> },
    { name: "Timeline", icon: <Clock size={20} />, subtitle: "Life events timeline", component: <TimelinePage /> }, // Removed unnecessary familyId prop from TimelinePage
    { name: "Family Tree", icon: <TreePalm size={20} />, subtitle: "Family relationships", component: <FamilyTree /> },
    { name: "Search", icon: <Search size={20} />, subtitle: "Find memories", component: <SearchComponent /> },
    { name: "Export ", icon: <Search size={20} />, subtitle: "Get PDF", component: <FamilyPDFGenerator  familyId={2}/> },
    { name: "Notificatoin ", icon: <Search size={20} />, subtitle: "Create Notification", component: <CreateNotification /> },
    
];

// --- Custom Right Panel Components (Static placeholders for structure) ---

const QuickStats = ({ stats }) => (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                    <span className="text-xl md:text-2xl font-bold text-purple-600">{stat.value}</span>
                    <span className="text-xs text-gray-500 text-center">{stat.label}</span>
                </div>
            ))}
        </div>
    </div>
);

const QuickActions = () => (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-lg border border-gray-200 mt-4 md:mt-6">
        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="space-y-3">
            {[
                { name: "Add New Memory", icon: <PlusCircle size={18} />, description: "Upload photos, videos, audio, or write a story" },
                { name: "Answer Prompts", icon: <BookText size={18} />, description: "Get inspired with memory questions" },
                { name: "Invite Family", icon: <Users size={18} />, description: "Add new family members to your circle" },
                { name: "Create Keepsake", icon: <Download size={18} />, description: "Export memories as a beautiful book" },
            ].map((action, index) => (
                <button 
                    key={index} 
                    className="flex items-start p-3 w-full rounded-lg hover:bg-purple-50 transition-colors text-left"
                >
                    <span className="text-purple-600 mr-3 mt-0.5 flex-shrink-0">{action.icon}</span>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{action.name}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

const RightPanelContent = () => { // Renamed from RightPanel to RightPanelContent for clarity within the component
    const staticStats = [
        { label: "Total Stories", value: 47 },
        { label: "Family Members", value: 12 },
        { label: "This Month", value: 8 },
        { label: "Events", value: 3 },
    ];
    
    // Static placeholder for recent activity
    const recentActivity = [
        "Grandma Sarah added a childhood memory 2 hours ago",
        "Uncle Mike uploaded family reunion photos 1 day ago",
        "System: Birthday reminder: Emma's birthday is tomorrow!",
        "John Doe created a new Family Circle 3 days ago",
    ];

    return (
        <div className="p-4 md:p-6">
            <QuickStats stats={staticStats} />
            <QuickActions />

            <div className="bg-white p-4 md:p-5 rounded-xl shadow-lg border border-gray-200 mt-4 md:mt-6">
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4  ">Recent Activity</h3>
                <ul className="space-y-3 text-sm">
                    {recentActivity.map((activity, index) => (
                        <li key={index} className="text-gray-700 border-b border-gray-100 pb-2 last:border-b-0 ">
                            <span className="text-purple-600 font-medium mr-1 ">•</span>
                            {activity}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


// =================================================================
// 2. Dashboard Layout Component (Fully Responsive)
// =================================================================
export default function DashboardLayout() {
    const [selectedComponentName, setSelectedComponentName] = useState("Overview");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for mobile sidebar

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth(); 

    // SECURITY CHECK
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/auth"); // redirect if not logged in
        }
    }, [isAuthenticated, navigate]);

    // Find the selected component from menuItems
    const selectedComponent = menuItems.find(
        (item) => item.name === selectedComponentName
    )?.component;

    const renderSidebarContent = () => (
        <div className="p-4 md:p-6 flex flex-col flex-1 overflow-y-auto">
            {/* Header section moved here for mobile view consistency */}
             <div className="mb-6 hidden lg:block">
                <h2 className="text-xl font-extrabold text-purple-800">Navigation</h2>
                <p className="text-sm font-medium text-gray-500">Explore your family's story</p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 ">
                {menuItems.map((item) => {
                    const isActive = selectedComponentName === item.name;
                    return (
                        <button
                            key={item.name}
                            onClick={() => { setSelectedComponentName(item.name); setIsSidebarOpen(false); }}
                            className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-lg"
                                        : "text-purple-700 hover:bg-purple-50"
                                }`}
                        >
                            <div className={`pt-1 ${isActive ? "text-white" : "text-purple-600"}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className={`font-semibold text-base ${isActive ? "text-white" : "text-gray-800"}`}>
                                    {item.name}
                                </p>
                                <p className={`text-xs ${isActive ? "text-purple-100" : "text-gray-500"}`}>
                                    {item.subtitle}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </nav>
            
            {/* Static Bottom Links (Visible only on the sidebar) */}
            <nav className="mt-auto pt-4 border-t border-gray-200 space-y-1">
                {[
                    { name: "Connections", icon: <Link size={18} />, subtitle: "Create operational links" },
                    { name: "Export", icon: <Download size={18} />, subtitle: "Create keepsakes" },
                    { name: "Notifications", icon: <Bell size={18} />, subtitle: "Updates & reminders", badge: 3 },
                ].map((item) => (
                    <button
                        key={item.name}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors text-left cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-purple-600 flex-shrink-0">{item.icon}</span>
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.subtitle}</p>
                            </div>
                        </div>
                        {item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );


    return (
        // Wrapper uses flex-col on mobile, flex-row on desktop (lg)
        <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden"> 
            
            {/* --- Mobile Header (Visible below lg) --- */}
            <header className="flex justify-between items-center p-4 border-b border-gray-200 lg:hidden bg-white sticky top-0 z-50 flex-shrink-0">
                 <h1 className="text-2xl font-bold text-purple-800">FAMLY</h1>
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                 </button>
            </header>

            {/* 1. Sidebar (Mobile Overlay & Desktop Fixed) */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform 
                             ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out 
                             lg:static lg:w-72 lg:translate-x-0 lg:flex flex-col border-r flex-shrink-0`}>
                
                <div className="flex-1 overflow-y-auto">
                     {renderSidebarContent()}
                </div>
            </aside>

            {/* 2. Main Content & Right Panel Wrapper (Takes up remaining horizontal space, scrolls vertically) */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Main Content Area: Scrolls vertically */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-4xl mx-auto lg:mx-0"> {/* Constrain width on smaller devices */}
                        {selectedComponent}
                    </div>
                </main>
                
                {/* Right Panel: Hidden on mobile, visible on desktop (xl) */}
                <aside className="hidden xl:block w-80 flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-y-auto">
                    <RightPanelContent />
                </aside>
            </div>
            
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
        </div>
    );
}