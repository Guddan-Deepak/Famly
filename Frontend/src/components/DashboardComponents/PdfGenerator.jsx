

import { useState, useEffect, useCallback } from "react";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext"; 

export default function FamilyPDFGenerator() {
  const { auth } = useAuth();
  const currentUserId = auth?.user?.user_id;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [allFamilies, setAllFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);

  // ✅ Fetch families for the logged-in user
  const fetchFamilyList = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/user/${currentUserId}/profile`);
      const families = res.data?.data?.families || [];
      setAllFamilies(families);

      if (families.length > 0) {
        const defaultFamily =
          families.find(fam => fam.Membership?.role === "admin") || families[0];
        setSelectedFamilyId(defaultFamily.family_id);
      }
    } catch (err) {
      console.error("Failed to load families:", err);
      setError("Failed to fetch families. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchFamilyList();
  }, [fetchFamilyList]);

  // ✅ Generate PDF using selected family_id
  const handleGeneratePDF = async () => {
    if (!selectedFamilyId) {
      setError("Please select a family first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        `/pdf/families/${selectedFamilyId}/stories`,
        { title, subtitle, description },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `family_${selectedFamilyId}_memories.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 UI Section
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <h1 className="text-2xl font-bold text-center text-green-800 mb-4">
        Generate Family Memories PDF
      </h1>

      {/* ✅ Family Selector */}
      {allFamilies.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">
            Select Family
          </label>
          <select
            value={selectedFamilyId || ""}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {allFamilies.map((fam) => (
              <option key={fam.family_id} value={fam.family_id}>
                {fam.family_name}{" "}
                {fam.Membership?.role === "admin" ? "(Admin)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter PDF title..."
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Enter subtitle..."
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description..."
            className="w-full border rounded-md p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={handleGeneratePDF}
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Generating PDF..." : "Generate & Download PDF"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

