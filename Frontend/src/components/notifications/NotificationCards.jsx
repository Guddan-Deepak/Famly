

import React from "react";
import api from "../../utils/axios";
import { Trash2, User, Clock, Tag } from "lucide-react";

export default function NotificationCard({ notification, onDelete, auth }) {
  const userId = parseInt(auth?.user?.user_id);
  const isSender = notification.meta?.fromUserId === userId;

  const handleDelete = async () => {
    // Confirmation before deleting
    const confirmed = window.confirm("Are you sure you want to delete this notification?");
    if (!confirmed) return;

    try {
      await api.delete(`/notification/${notification._id}`);
      if (onDelete) onDelete(notification._id); // remove from frontend state
    } catch (err) {
      console.error("Failed to delete notification:", err.response?.data?.message || "Error deleting notification.");
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const typeColor = {
    general: 'bg-indigo-500',
    birthday: 'bg-pink-500',
    anniversary: 'bg-green-500',
  }[notification.type] || 'bg-gray-500';


  
  let senderName = notification.user?.fullname;
  let messageText = notification.message || "";

  if (!senderName && messageText) {
    const match = messageText.match(/^(.+?)\s+says:\s*/);
    if (match && match[1]) {
      senderName = match[1];
      messageText = messageText.replace(/^(.+?)\s+says:\s*/, ""); // remove "Name says: " from message
    }
  }

  senderName = senderName || "System";
  
  const toReceiverAddress = auth?.user?.fullname || "You (Current User)"; 
  console.log(toReceiverAddress , " " , auth?.user ,  " ", senderName)
  return (
    <div
      className={`bg-white rounded-2xl p-5 mb-5 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition duration-300 ease-in-out border-l-4 ${
        notification.status === "unread" ? "border-blue-500" : "border-gray-200"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <span
          className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full ${typeColor} shadow-md`}
        >
          <Tag size={12} className="inline mr-1 -mt-0.5" />
          {notification.type}
        </span>
        {isSender && (
          <button
            onClick={handleDelete}
            title="Delete Notification"
            className="text-red-400 hover:text-red-600 transition duration-150 p-1 rounded-full hover:bg-red-100"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-snug">
        {notification.title}
      </h3>

      <div className="text-gray-700 text-base mb-3 font-medium">
        <span className="font-semibold text-gray-800 flex items-center mb-1 text-lg">
          <User size={16} className="mr-2 text-indigo-500 " />
          { senderName }:
        </span>
        <p className="pl-6 text-gray-700 font-serif italic text-lg leading-relaxed">
          "{notification.message}"
        </p>
      </div>

      <div className="text-sm text-gray-500 mb-3 border-t pt-3">
        <span className="font-medium text-indigo-600">
          To Address: {toReceiverAddress}
        </span>
      </div>

      <div className="flex items-center text-xs text-gray-500 mt-2">
        <Clock size={12} className="mr-1" />
        <time dateTime={notification.createdAt}>{formattedDate}</time>
      </div>
    </div>
  );
}
