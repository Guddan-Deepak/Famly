import { useState } from "react";
import api from "../../utils/axios"; 

export default function CreateNotification() {
  const [type, setType] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Submit notification to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // POST /notification/create
      const response = await api.post("/notification/create", {
        type,
        title,
        message,
      });

      setSuccess("Notification sent successfully!");
      setTitle("");
      setMessage("");
      setType("general");
      console.log("Notification response:", response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to send notification. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Notification</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block font-semibold mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="general">General</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter notification title"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block font-semibold mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Enter notification message"
            className="w-full border rounded p-2 h-24 resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>

        {/* Error / Success messages */}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
    </div>
  );
}
