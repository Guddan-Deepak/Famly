

import { useEffect, useState } from "react";
import api from "../../utils/axios";
import { getAuthData } from "../../utils/auth.utils";
import NotificationCard from "../../components/notifications/NotificationCards.jsx";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const auth = getAuthData();
  const userId = parseInt(auth?.user?.user_id);

  const fetchNotifications = async (pageNumber = 1) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get(`/notification/user?page=${pageNumber}`);
      const data = res.data.data;
      setNotifications(data.notifications);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notifId));
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page, userId]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      {/* 🎨 Enhanced Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 tracking-tight">
          Notifications & Reminders
        </h1>
        <p className="text-lg font-semibold text-gray-600">
          Stay connected with important family moments
        </p>
      </div>

      {loading && <p className="text-gray-500 text-center">Loading notifications...</p>}

      {!loading && notifications.length === 0 && (
        <p className="text-gray-500 text-center">No notifications available.</p>
      )}

      {notifications.map((notif) => (
        <NotificationCard
          key={notif._id}
          notification={notif}
          onDelete={handleDeleteNotification}
          auth={auth}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Prev
          </button>
          <span className="font-medium text-gray-700">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
