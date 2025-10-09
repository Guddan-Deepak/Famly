import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/authContext";
import api from "../../utils/axios";
import { ArrowLeft, Save, X } from "lucide-react";

const EditStoryPage = () => {
  const { storyId } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    caption: ""
  });

  const currentUser = auth?.user;

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/content/story/${storyId}`);
        const storyData = res.data.data;
        
        // Check if user owns the story
        if (currentUser?.user_id !== storyData.uploaded_by?.user_id) {
          navigate(-1);
          return;
        }
        
        setStory(storyData);
        setFormData({ caption: storyData.caption || "" });
        
      } catch (err) {
        console.error("Error fetching story:", err);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId, currentUser?.user_id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (saving) return;
    
    try {
      setSaving(true);
      await api.put(`/content/story/${storyId}`, {
        caption: formData.caption
      });
      
      navigate(`/stories/${storyId}`);
    } catch (err) {
      console.error("Error updating story:", err);
      alert("Failed to update story. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-600 font-medium mt-4">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Story not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Cancel
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">Edit Story</h1>
            
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Story Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h2>
            <p className="text-gray-600">You can only edit the caption of this story.</p>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                Story Caption
              </label>
              <textarea
                id="caption"
                name="caption"
                rows={6}
                value={formData.caption}
                onChange={handleChange}
                placeholder="Tell the story behind this memory..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.caption.length}/500 characters
              </p>
            </div>

            {/* Media Preview */}
            {story.media && story.media.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media ({story.media.length} items)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {story.media.map((media, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {media.type === 'image' && (
                        <img
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      {media.type === 'video' && (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Video</span>
                        </div>
                      )}
                      {media.type === 'audio' && (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">Audio</span>
                        </div>
                      )}
                      {media.type === 'text' && (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center p-2">
                          <span className="text-gray-500 text-sm line-clamp-3">
                            {media.text}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditStoryPage;