
// import React, { useState } from "react";
// import { useAuth } from "../../utils/authContext";
// import api from "../../utils/axios";


// const AddMemory = ({ familyId }) => {

//   // --- Start Mock/Placeholder Functions for Context (Replace with your actual imports) ---
//   // const useAuth = () => ({ isAuthenticated: true, user: { user_id: 1 } }); 
//   // const api = {
//   //   post: async (url, data, config) => {
//   //     console.log("Submitting to:", url);
//   //     console.log("FormData keys:", Array.from(data.keys()));
//   //     console.log("--- Frontend Debug Output (mediaText array sent to backend) ---");
//   //     // Logging mediaText for debug, as you requested:
//   //     console.log(Array.from(data.getAll("mediaText"))); 
//   //     // Simulate successful API call
//   //     return new Promise(resolve => setTimeout(() => resolve({ data: { message: "Story created" } }), 1000));
//   //   }
//   // };
//   // // --- End Mock/Placeholder Functions ---

//   const { isAuthenticated } = useAuth();

//   const [title, setTitle] = useState("");
//   const [caption, setCaption] = useState("");
//   const [memoryDate, setMemoryDate] = useState("");
  
//   // Refactored state: blocks now holds ALL content in sequence
//   const [blocks, setBlocks] = useState([]); // { type: "text" | "media", value: string | File }
//   const [uploading, setUploading] = useState(false);

//   const addTextBlock = () => {
//     // Prevent adding empty text block after another empty text block
//     if (blocks.length > 0 && blocks[blocks.length - 1].type === "text" && blocks[blocks.length - 1].value.trim() === "") {
//       alert("⚠ Please write something in the previous text block first.");
//       return;
//     }
//     setBlocks([...blocks, { type: "text", value: "" }]); 
//   };

//   const addMediaBlock = (e) => {
//     const files = Array.from(e.target.files);
//     const newBlocks = [...blocks];
//     files.forEach((file) => {
//       // For media, 'value' is the File object. Text is not captured.
//       newBlocks.push({ type: "media", value: file });
//     });
//     setBlocks(newBlocks);
//     e.target.value = null; // Reset input so same file can be chosen again
//   };

//   const handleBlockTextChange = (index, value) => {
//     const newBlocks = [...blocks];
//     newBlocks[index].value = value;
//     setBlocks(newBlocks);
//   };

//   const removeBlock = (index) => {
//     const newBlocks = [...blocks];
//     // IMPORTANT: Revoke the URL object to free up browser memory if it was a file block
//     if (newBlocks[index].type === "media" && newBlocks[index].value) {
//         URL.revokeObjectURL(URL.createObjectURL(newBlocks[index].value));
//     }
//     newBlocks.splice(index, 1);
//     setBlocks(newBlocks);
//   };
  
//   // *** Removed Tag handling functions (handleTagChange, removeTag) ***

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isAuthenticated) {
//       alert("⚠ Please sign in first.");
//       window.location.href = "/auth";
//       return;
//     }

//     const mediaText = [];
//     const mediaFiles = [];
    
//     // ** Core Logic for Backend Alignment **
//     blocks.forEach((block) => {
//       if (block.type === "text") {
//         // 1. Text Block: Add its content to mediaText.
//         mediaText.push(block.value || ""); 
//       } else if (block.type === "media" && block.value) {
//         // 2. Media Block: Add the file to mediaFiles.
//         // Add an EMPTY string "" to mediaText as a placeholder for the file.
//         mediaFiles.push(block.value); 
//         mediaText.push(""); 
//       }
//     });
//     // ** End Core Logic **

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("caption", caption);
//     formData.append("memory_date", memoryDate);
    
//     // Append all files and aligned text/placeholders
//     mediaFiles.forEach((f) => formData.append("mediaFiles", f));
//     mediaText.forEach((t) => formData.append("mediaText", t));
//      console.log("add files" ,mediaFiles)
//      console.log("add text " ,mediaText)
//     // *** Removed tags from formData ***

//     try {
//       setUploading(true);
//       await api.post(`/content/create-story/${familyId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("✅ Story uploaded successfully!");
      
//       // Reset state
//       setTitle(""); setCaption(""); setMemoryDate(""); setBlocks([]);
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to upload story.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-100 to-purple-200 shadow-xl shadow-purple-500/20 rounded-2xl p-8 mt-6 border border-purple-200">
//       <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
//         ✨ Create a New Memory ✨
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
        
//         {/* Title, Caption, Date inputs */}
//         <input 
//           type="text" 
//           placeholder="Title *" 
//           value={title} 
//           onChange={(e) => setTitle(e.target.value)} 
//           required 
//           className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" 
//         />
//         <input 
//           type="text" 
//           placeholder="Caption" 
//           value={caption} 
//           onChange={(e) => setCaption(e.target.value)} 
//           className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
//         />
//         <input 
//           type="date" 
//           value={memoryDate} 
//           onChange={(e) => setMemoryDate(e.target.value)} 
//           className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
//         />

//         {/* *** Tags Input and Display Removed *** */}

//         {/* Add block buttons */}
//         <div className="flex gap-4 mb-4">
//           <button 
//             type="button" 
//             onClick={addTextBlock} 
//             className="bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
//           >
//             ➕ Add Text Block
//           </button>
//           <label className="bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md">
//             📸 Add Media Block
//             <input type="file" accept="image/*,video/*,audio/*" multiple onChange={addMediaBlock} className="hidden" />
//           </label>
//         </div>

//         {/* Render blocks */}
//         {blocks.map((b, i) => (
//           <div key={i} className="border border-white/30 bg-black/10 backdrop-blur-sm rounded-lg p-4 mb-4 relative">
//             <button 
//               type="button" 
//               onClick={() => removeBlock(i)} 
//               className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold transition rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-100"
//               aria-label={`Remove block ${i + 1}`}
//             >
//               ✖
//             </button>
            
//             {b.type === "media" && b.value && (
//               <>
//                 <p className="text-sm font-bold text-purple-800 mb-2">Media Block: {b.value.name}</p>
//                 {b.value.type.startsWith("image") && <img src={URL.createObjectURL(b.value)} alt="preview" className="w-full h-48 object-cover rounded-lg mb-3" />}
//                 {b.value.type.startsWith("video") && <video src={URL.createObjectURL(b.value)} controls className="w-full h-48 rounded-lg mb-3 object-cover" />}
//                 {b.value.type.startsWith("audio") && <audio src={URL.createObjectURL(b.value)} controls className="w-full mb-3" />}
//               </>
//             )}
            
//             {/* *** CONDITIONAL TEXTAREA: Only render for text blocks *** */}
//             {b.type === "text" && (
//               <textarea
//                 value={b.value}
//                 onChange={(e) => handleBlockTextChange(i, e.target.value)}
//                 placeholder="Write your memory text here..."
//                 className="w-full bg-black/10 border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
//                 rows={3}
//               />
//             )}
//           </div>
//         ))}

//         {/* Submit button */}
//         <button 
//           type="submit" 
//           disabled={uploading} 
//           className={`cursor-pointer w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}`}
//         >
//           {uploading ? "Uploading..." : "Upload Memory"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddMemory;

import React, { useState } from "react";
import { useAuth } from "../../utils/authContext";
import api from "../../utils/axios";

const AddMemory = ({ familyId, onSuccess, onClose }) => {
  const { auth } = useAuth();
  const isAuthenticated = !!auth?.accessToken;

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  
  const [blocks, setBlocks] = useState([]);
  const [uploading, setUploading] = useState(false);

  const addTextBlock = () => {
    if (blocks.length > 0 && blocks[blocks.length - 1].type === "text" && blocks[blocks.length - 1].value.trim() === "") {
      alert("⚠ Please write something in the previous text block first.");
      return;
    }
    setBlocks([...blocks, { type: "text", value: "" }]); 
  };

  const addMediaBlock = (e) => {
    const files = Array.from(e.target.files);
    const newBlocks = [...blocks];
    files.forEach((file) => {
      newBlocks.push({ type: "media", value: file });
    });
    setBlocks(newBlocks);
    e.target.value = null;
  };

  const handleBlockTextChange = (index, value) => {
    const newBlocks = [...blocks];
    newBlocks[index].value = value;
    setBlocks(newBlocks);
  };

  const removeBlock = (index) => {
    const newBlocks = [...blocks];
    if (newBlocks[index].type === "media" && newBlocks[index].value) {
        URL.revokeObjectURL(URL.createObjectURL(newBlocks[index].value));
    }
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("⚠ Please sign in first.");
      window.location.href = "/auth";
      return;
    }

    const mediaText = [];
    const mediaFiles = [];
    
    blocks.forEach((block) => {
      if (block.type === "text") {
        mediaText.push(block.value || ""); 
      } else if (block.type === "media" && block.value) {
        mediaFiles.push(block.value); 
        mediaText.push(""); 
      }
    });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("caption", caption);
    formData.append("memory_date", memoryDate);
    
    mediaFiles.forEach((f) => formData.append("mediaFiles", f));
    mediaText.forEach((t) => formData.append("mediaText", t));

    try {
      setUploading(true);
      await api.post(`/content/create-story/${familyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Story uploaded successfully!");
      
      // Reset state
      setTitle(""); 
      setCaption(""); 
      setMemoryDate(""); 
      setBlocks([]);
      
      // Call success callback to refresh stories and close popup
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload story.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className=" max-w-3xl mx-auto bg-gradient-to-br from-indigo-100 to-purple-200 shadow-xl shadow-purple-500/20 rounded-2xl p-8 mt-6 border border-purple-200">
      
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
        ✨ Create a New Memory ✨
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <input 
          type="text" 
          placeholder="Title *" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" 
        />
        <input 
          type="text" 
          placeholder="Caption" 
          value={caption} 
          onChange={(e) => setCaption(e.target.value)} 
          className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
        />
        <input 
          type="date" 
          value={memoryDate} 
          onChange={(e) => setMemoryDate(e.target.value)} 
          className="w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
        />

        <div className="flex gap-4 mb-4">
          <button 
            type="button" 
            onClick={addTextBlock} 
            className="bg-teal-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md cursor-pointer"
          >
            ➕ Add Text Block
          </button>
          <label className="bg-indigo-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-600 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md">
            📸 Add Media Block
            <input type="file" accept="image/*,video/*,audio/*" multiple onChange={addMediaBlock} className="hidden" />
          </label>
        </div>

        {blocks.map((b, i) => (
          <div key={i} className="border border-white/30 bg-black/10 backdrop-blur-sm rounded-lg p-4 mb-4 relative">
            <button 
              type="button" 
              onClick={() => removeBlock(i)} 
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold transition rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-100"
            >
              ✖
            </button>
            
            {b.type === "media" && b.value && (
              <>
                <p className="text-sm font-bold text-purple-800 mb-2">Media Block: {b.value.name}</p>
                {b.value.type.startsWith("image") && <img src={URL.createObjectURL(b.value)} alt="preview" className="w-full h-48 object-cover rounded-lg mb-3" />}
                {b.value.type.startsWith("video") && <video src={URL.createObjectURL(b.value)} controls className="w-full h-48 rounded-lg mb-3 object-cover" />}
                {b.value.type.startsWith("audio") && <audio src={URL.createObjectURL(b.value)} controls className="w-full mb-3" />}
              </>
            )}
            
            {b.type === "text" && (
              <textarea
                value={b.value}
                onChange={(e) => handleBlockTextChange(i, e.target.value)}
                placeholder="Write your memory text here..."
                className="w-full bg-black/10 border border-white/20 rounded-lg p-3 text-lg text-purple-900 font-medium placeholder:text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                rows={3}
              />
            )}
          </div>
        ))}

        <button 
          type="submit" 
          disabled={uploading} 
          className={`cursor-pointer w-full py-3 rounded-lg text-white font-semibold text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl ${uploading ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}`}
        >
          {uploading ? "Uploading..." : "Upload Memory"}
        </button>
      </form>
    </div>
  );
};

export default AddMemory;
