import { Story } from "../models/story.models.js";
import { deleteAudioOnCloudinary, deleteImageOnCloudinary, deleteVideoOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {User,Family,Membership} from "../models/index.js";

import natural from "natural";
import sw from "stopword";

const API_KEY = process.env.HUGGINGFACE_API_KEY;


async function generateTagsFromText(text) {
  if (!text) return [];

  try {
    // Prepare the request body for Hugging Face's NER model
    const requestBody = {
      inputs: text,
    };

    // Make the request to Hugging Face API using fetch
    const response = await fetch('https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // If the response status is not ok (i.e., not 200), return an empty array
    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.statusText}`);
      return [];  // Return empty array if the response is not successful
    }

    // Parse the response JSON
    const data = await response.json();

    // Extract tags from named entities (e.g., person, location, organization, etc.)
    const tags = [];
    data.forEach(entity => {
      if (entity.entity_group) {
        tags.push(entity.word.toLowerCase()); // Collecting the entities
      }
    });

    // Return the tags
    return tags;
  } catch (err) {
    // Log the error and return an empty array if something goes wrong
    console.error("❌ Hugging Face NER error:", err);
    return [];  // Return an empty array in case of error
  }
}



async function generateTagsFromImage(url) {
  try {
    // Prepare the request body
    const requestBody = {
      inputs: { image: url },  // You can also pass a base64-encoded image if needed
    };

    // Make the request to Hugging Face API using fetch
    const response = await fetch('https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer $
        {API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Parse the response JSON
    const data = await response.json();

    // Extract tags (labels) from the response
    const tags = data[0].labels || [];
    
    // Clean and return the tags in lowercase
    return tags.map(tag => tag.toLowerCase());
  } catch (err) {
    console.error("❌ Hugging Face image tagging error:", err);
    return [];
  }
}



function mergeTags(...tagArrays) {
  return [...new Set(tagArrays.flat().map(t => t.toLowerCase()))];
}

const createStory = asyncHandler(async (req, res) => {
  const { title, caption, memory_date } = req.body;
  const family_id = Number(req.params.family_id);
  const uploaded_by = Number(req.user.user_id); // from auth middleware
  const mediaFiles = req.files || []; // from multer
  const mediaTextRaw = req.body.mediaText;
  const mediaText = Array.isArray(mediaTextRaw)
    ? mediaTextRaw
    : mediaTextRaw
    ? [mediaTextRaw]
    : [];


  if (!title || !family_id) {
    throw new ApiError(400, "Title and family_id are required");
  }

  let allAITags = [];
  const media = [];
  let mediaIdx = 0;  // to track the index of mediaFiles for matching with mediaText

  let captionTags = [];
  if (caption) {
    const regex = /#(\w+)/g;
    captionTags = [];
    let match;
    while ((match = regex.exec(caption)) !== null) {
      captionTags.push(match[1]);
    }
  }

  // GPT tags from caption
  // const captionAITags = await generateTagsFromText(caption);
  const captionAITags=[];
 console.log(mediaFiles);
 console.log(mediaText);
  for (let i = 0; i < mediaText.length; i++) {
    let mediaAITags = [];
    let textForTags = "";
    let textTags = [];
    let uploadResponse = null;  // Initialize it here

    if (!mediaText[i]) {
      // Handle media file if mediaText[i] is empty
      const file = mediaFiles[mediaIdx];

      let resourceType = "auto";
      if (file.mimetype.startsWith("image")) resourceType = "image";
      if (file.mimetype.startsWith("video")) resourceType = "video";
      if (file.mimetype.startsWith("audio")) resourceType = "video";

      // Upload the media file to Cloudinary
      uploadResponse = await uploadOnCloudinary(file.path, resourceType);

      // Generate tags using OpenAI Vision (for images)
      if (resourceType === "image") {
        // mediaAITags = await generateTagsFromImage(uploadResponse.secure_url);
        mediaAITags=[];
      }

      // Increment mediaIdx only for files
      mediaIdx++;
    } else {
      // If mediaText[i] exists, generate semantic tags from text
      textForTags = mediaText[i];
      // textTags = await generateTagsFromText(textForTags);
      textTags=[];
    }

    // Merge all tags (media, text, caption)
    allAITags = mergeTags(allAITags, mediaAITags, textTags);

    // Add the media or text to the media array
    media.push({
      type: uploadResponse ? uploadResponse.resource_type : "text",  // If there is no uploadResponse, it's just text
      url: uploadResponse ? uploadResponse.secure_url : null,  // Only assign URL if media is uploaded
      text: mediaText[i] || "",  // Text for the media
      order: i,
    });
  }

  // Final merged tags (caption, media text, and AI-generated tags)
  const finalTags = mergeTags(allAITags, captionTags, captionAITags);

  // Create the story in the database
  const story = await Story.create({
    title,
    caption,
    family_id,
    uploaded_by,
    media,
    memory_date,
    tags: finalTags,
  });

  return res.status(200).json(new ApiResponse(200, story, "Story uploaded successfully!"));
});


const deleteStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  
  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    throw new ApiError(404, "Invalid or missing Story ID");
  }

  
  const story = await Story.findById(storyId);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  
  if (story.uploaded_by.toString() !== req.user.user_id.toString()) {
    throw new ApiError(401, "You are not authorised to delete this story");
  }

 
  for (const media of story.media) {
   try {
    if (media.type === "image") await deleteImageOnCloudinary(media.url);
    else if (media.type === "video") await deleteVideoOnCloudinary(media.url);
    else if (media.type === "audio") await deleteAudioOnCloudinary(media.url);
  } catch (err) {
    console.error(`Failed to delete ${media.type} from Cloudinary:`, err);
  }
  }

  
  const deletedStory = await Story.findByIdAndDelete(storyId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedStory, "Story deleted successfully!"));
});

 const likeStory = asyncHandler(async (req ,  res) => {
  const { storyId } = req.params;

 
  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    throw new ApiError(404, "Invalid or missing Story ID");
  }

  
  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, "Story not found");

  const userId = req.user.user_id.toString();

  if (!story.liked_by.includes(userId)) {
    story.liked_by.push(userId);
    await story.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story liked successfully!"));
});


const unlikeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  
  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    throw new ApiError(404, "Invalid or missing Story ID");
  }


  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, "Story not found");

  const userId = req.user.user_id.toString();
  story.liked_by = story.liked_by.filter(id => id.toString() !== userId);

  await story.save();

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story unliked successfully!"));
});
// fetching  family story acccording to memory date
// const getFamilyStoriesAsc = asyncHandler(async (req, res) => {
//   const { familyId } = req.params;
//   const limit = parseInt(req.query.limit) || 10;
//   const page = parseInt(req.query.page) || 1;

//   if (!familyId) throw new ApiError(400, "Family ID is required");

//   // Convert familyId to integer
//   const familyIdNum = parseInt(familyId);

//   const stories = await Story.find({ family_id: familyIdNum })
//     .sort({ memory_date: 1 }) // ascending
//     .skip((page - 1) * limit)
//     .limit(limit);

//   const total = await Story.countDocuments({ family_id: familyIdNum });

//   return res.status(200).json(
//     new ApiResponse(200, {
//       stories,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }, "Stories fetched in ascending order")
//   );
// });
// fetching family stories according to recent uploaded date

// const getFamilyStoriesAsc = asyncHandler(async (req, res) => {
//   const { familyId } = req.params;
//   const limit = parseInt(req.query.limit) || 10;
//   const page = parseInt(req.query.page) || 1;

//   if (!familyId) throw new ApiError(400, "Family ID is required");

//   // Fetch stories from MongoDB
//   const stories = await Story.find({ family_id: Number(familyId) })
//     .sort({ memory_date: 1 })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .lean();

//   const total = await Story.countDocuments({ family_id: Number(familyId) });

//   // 1️⃣ Collect unique user_ids from stories
//   const userIds = [...new Set(stories.map(s => s.uploaded_by))];

//   // 2️⃣ Fetch users from PostgreSQL
//   const users = await User.findAll({
//     where: { user_id: userIds },
//     attributes: ["user_id", "fullname" ,"profile_url"],
//     raw: true,
//   });

//   // Convert users to a lookup map
//   const userMap = {};
//   users.forEach(u => {
//     userMap[u.user_id] = u.fullname;
//   });

//   // 3️⃣ Merge user fullname into stories
//   const enrichedStories = stories.map(story => ({
//     ...story,
//     uploaded_by: {
//       user_id: story.uploaded_by,
//       fullname: userMap[story.uploaded_by] || "Unknown User",
//     },
//   }));

//   return res.status(200).json(
//     new ApiResponse(200, {
//       stories: enrichedStories,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }, "Stories fetched with uploader names")
//   );
// });

const getFamilyStoriesAsc = asyncHandler(async (req, res) => {
  const { familyId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  if (!familyId) throw new ApiError(400, "Family ID is required");

  // 1️⃣ Fetch stories from MongoDB
  const stories = await Story.find({ family_id: Number(familyId) })
    .sort({ memory_date: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Story.countDocuments({ family_id: Number(familyId) });

  // 2️⃣ Collect unique user_ids from stories
  const userIds = [...new Set(stories.map(s => s.uploaded_by))];

  // 3️⃣ Fetch users from PostgreSQL including profilePhoto
  const users = await User.findAll({
    where: { user_id: userIds },
    attributes: ["user_id", "fullname", "profilePhoto","username"],
    raw: true,
  });

  // 4️⃣ Convert users to a lookup map
  const userMap = {};
  users.forEach(u => {
    userMap[u.user_id] = {
      fullname: u.fullname,
      profilePhoto: u.profilePhoto || null,
      username:u.username||null,
    };
  });

  // 5️⃣ Merge user data into stories
  const enrichedStories = stories.map(story => ({
    ...story,
    uploaded_by: {
      user_id: story.uploaded_by,
      ...userMap[story.uploaded_by] || { fullname: "Unknown User", profilePhoto: null },
    },
  }));

  // 6️⃣ Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories: enrichedStories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Stories fetched with uploader info"
    )
  );
});





// fetching family stroies according to recent uploaded date


const getFamilyStoriesDesc = asyncHandler(async (req, res) => {
  const { familyId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  if (!familyId) throw new ApiError(400, "Family ID is required");

  // 1️⃣ Fetch stories from MongoDB
  const stories = await Story.find({ family_id: Number(familyId) })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Story.countDocuments({ family_id: Number(familyId) });

  // 2️⃣ Collect unique user_ids from stories
  const userIds = [...new Set(stories.map(s => s.uploaded_by))];

  // 3️⃣ Fetch users from PostgreSQL including profilePhoto
  const users = await User.findAll({
    where: { user_id: userIds },
    attributes: ["user_id", "fullname", "profilePhoto","username"],
    raw: true,
  });

  // 4️⃣ Convert users to a lookup map
  const userMap = {};
  users.forEach(u => {
    userMap[u.user_id] = {
      fullname: u.fullname,
      profilePhoto: u.profilePhoto || null,
      username:u.username||null,
    };
  });

  // 5️⃣ Merge user data into stories
  const enrichedStories = stories.map(story => ({
    ...story,
    uploaded_by: {
      user_id: story.uploaded_by,
      ...userMap[story.uploaded_by] || { fullname: "Unknown User", profilePhoto: null },
    },
  }));

  // 6️⃣ Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories: enrichedStories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Stories fetched with uploader info"
    )
  );
});



// const getFamilyStoriesDesc = asyncHandler(async (req, res) => {
//   const { familyId } = req.params;
//   const limit = parseInt(req.query.limit) || 10;
//   const page = parseInt(req.query.page) || 1;

//   if (!familyId) throw new ApiError(400, "Family ID is required");

//   const stories = await Story.find({ family_id: familyId })
//     .sort({ createdAt: -1 }) // descending
//     .skip((page - 1) * limit)
//     .limit(limit);

//   const total = await Story.countDocuments({ family_id: familyId });

//   return res.status(200).json(
//     new ApiResponse(200, {
//       stories,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     }, "Stories fetched in descending order")
//   );
// });


// future aspects

// const updateStory = asyncHandler(async (req, res) => {
//   const { storyId } = req.params;
//   const { caption, deleteMediaIndexes = [], mediaText = [] } = req.body; // deleteMediaIndexes: array of indexes in story.media
//   const newFiles = req.files; // multer uploaded files
//   const userId = req.user.user_id;

//   if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
//     throw new ApiError(404, "Invalid or missing Story ID");
//   }

//   const story = await Story.findById(storyId);
//   if (!story) throw new ApiError(404, "Story not found");

//   if (story.uploaded_by.toString() !== userId.toString()) {
//     throw new ApiError(401, "You are not authorized to update this story");
//   }

 
//   if (deleteMediaIndexes.length > 0) {
//     // Ensure not all media are deleted
//     if (deleteMediaIndexes.length >= story.media.length) {
//       throw new ApiError(400, "You cannot delete all media from a story");
//     }

//     // Delete from Cloudinary and remove from array
//     deleteMediaIndexes.sort((a, b) => b - a).forEach(index => {
//       const media = story.media[index];
//       if (media.type === "image") deleteImageOnCloudinary(media.url);
//       if (media.type === "video") deleteVideoOnCloudinary(media.url);
//       if (media.type === "audio") deleteAudioOnCloudinary(media.url);
//       story.media.splice(index, 1);
//     });
//   }

//   // Update caption if provided
//   if (caption !== undefined) story.caption = caption;

//   // Add new media files
//   if (newFiles && newFiles.length > 0) {
//     for (let i = 0; i < newFiles.length; i++) {
//       const file = newFiles[i];
//       let resourceType = "auto";

//       if (file.mimetype.startsWith("image")) resourceType = "image";
//       if (file.mimetype.startsWith("video")) resourceType = "video";
//       if (file.mimetype.startsWith("audio")) resourceType = "audio";

//       const uploadResponse = await uploadOnCloudinary(file.path, resourceType);

//       story.media.push({
//         type: resourceType,
//         url: uploadResponse.secure_url,
//         text: mediaText[i] || "",
//         order: story.media.length
//       });
//     }
//   }

//   await story.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, story, "Story updated successfully!"));
// });

const updateStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { caption } = req.body; // Only allow updating caption
  const userId = req.user.user_id;

  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    throw new ApiError(404, "Invalid or missing Story ID");
  }

  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, "Story not found");

  if (story.uploaded_by.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this story");
  }

  // Update caption if provided
  if (caption !== undefined) story.caption = caption;

  await story.save();

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Caption updated successfully!"));
});

const getStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  
  if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
    throw new ApiError(404, "Invalid or missing Story ID");
  }

  // Fetch the story
  const story = await Story.findById(storyId);
  if (!story) throw new ApiError(404, "Story not found");

  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story fetched successfully!"));
});

// fetches recent stories (posts/memories) from all families that the logged-in user belongs to,
// const getRecentStories = asyncHandler(async (req, res) => {
//   const userId = req.user.user_id; // from auth middleware
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

  
//   const memberships = await Membership.findAll({ where: { user_id: userId } });
//   const familyIds = memberships.map(m =>  parseInt(m.family_id));

//   if (familyIds.length === 0) {
//     return res.status(200).json(new ApiResponse(200, [], "No stories found"));
//   }

  
//   const stories = await Story.find({ family_id: { $in: familyIds } })
//     .sort({ memory_date: -1, createdAt: -1 }) // recent first
//     .skip(skip)
//     .limit(limit);


//   const totalStories = await Story.countDocuments({ family_id: { $in: familyIds } });
//   const totalPages = Math.ceil(totalStories / limit);

//   return res.status(200).json(
//     new ApiResponse(200, {
//       stories,
//       pagination: {
//         page,
//         limit,
//         totalPages,
//         totalStories
//       }
//     }, "Recent stories fetched successfully")
//   );
// });

const getRecentStories = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 1️⃣ Get families where this user is a member
  const memberships = await Membership.findAll({ where: { user_id: userId } });
  const familyIds = memberships.map(m => parseInt(m.family_id));

  if (familyIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No stories found"));
  }

  // 2️⃣ Get stories from MongoDB
  const stories = await Story.find({ family_id: { $in: familyIds } })
    .sort({ memory_date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // lean for better performance

  // 3️⃣ Collect all uploader IDs
  const uploaderIds = [...new Set(stories.map(s => s.uploaded_by))];

  // 4️⃣ Fetch user info from PostgreSQL in one query
  const users = await User.findAll({
    where: { user_id: uploaderIds },
    attributes: ["user_id", "fullname", "username", "profilePhoto"],
    raw: true,
  });

  // Convert to a quick lookup map
  const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));

  // 5️⃣ Merge user info into each story
  const storiesWithUser = stories.map(story => ({
    ...story,
    uploaded_by_user: userMap[story.uploaded_by] || null,
  }));

  // 6️⃣ Pagination
  const totalStories = await Story.countDocuments({ family_id: { $in: familyIds } });
  const totalPages = Math.ceil(totalStories / limit);

  // 7️⃣ Send final response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stories: storiesWithUser,
        pagination: { page, limit, totalPages, totalStories },
      },
      "Recent stories fetched successfully"
    )
  );
});

// fetching all user stories 
const getUserRecentStories = asyncHandler(async (req, res) => {
    const userId = parseInt(req.user.user_id); // from auth middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1️⃣ Fetch stories uploaded by this user from MongoDB
    const stories = await Story.find({ uploaded_by: userId })
        .sort({ memory_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() for better performance

    // --- Data Enrichment Steps (Focus on Family Details) ---
    
    // 2️⃣ Collect all unique family IDs from the fetched stories
    const familyIds = [...new Set(stories.map(s => s.family_id))];

    // 3️⃣ Fetch family information (Name and Photo) from PostgreSQL
    let familyMap = {};
    if (familyIds.length > 0) {
        const families = await Family.findAll({
            where: { family_id: familyIds },
            // Fetch only the family details required for the story card
            attributes: ["family_id", "family_name", "familyPhoto"], 
            raw: true,
        });

        // Convert to a quick lookup map { family_id: { family_id, family_name, familyPhoto } }
        familyMap = Object.fromEntries(
            families.map(f => [f.family_id, f])
        );
    }
    
    // 4️⃣ Merge family info into each story
    const storiesWithDetails = stories.map(story => {
        const familyInfo = familyMap[story.family_id] || { 
            family_name: "Unknown Family",
            familyPhoto: null
        };
        
        return {
            ...story,
            // We skip fetching Uploader details (username, fullname) here,
            // as the frontend already knows this user. We'll attach the user ID
            // but the client will need to use its local auth context for the rest.
            
            // Attach family details
            family_name: familyInfo.family_name,
            family_photo: familyInfo.familyPhoto, // Added familyPhoto
        };
    });

    // 5️⃣ Pagination calculation
    const totalStories = await Story.countDocuments({ uploaded_by: userId });
    const totalPages = Math.ceil(totalStories / limit);

    // 6️⃣ Send final response
    return res.status(200).json(
        new ApiResponse(200, {
            stories: storiesWithDetails,
            pagination: { page, limit, totalPages, totalStories }
        }, "User's recent stories fetched successfully")
    );
});

const extractTagsFromQuery = (query) => {
  const tokenizer = new natural.WordTokenizer();
  let words = tokenizer.tokenize(query);

  // Lowercase
  words = words.map((w) => w.toLowerCase());

  // Remove stopwords
  words = sw.removeStopwords(words);

  // Remove duplicates
  words = [...new Set(words)];

  return words;
};




// --- Search Stories with Pagination ---
 const searchStories = asyncHandler(async (req, res) => {
  const family_id=parseInt(req.params.family_id)
  const  query  = req.query.query; // or req.query.search
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Step 1: Extract tags
  const tags = extractTagsFromQuery(query);

  if (!tags.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No meaningful tags found"));
  }

  // Step 2: Aggregation with pagination
  const pipeline = [
    {
      $match: {
        family_id: Number(family_id),
        tags: { $in: tags }, // must share at least one tag
      },
    },
    {
      $addFields: {
        matchCount: { $size: { $setIntersection: ["$tags", tags] } },
      },
    },
    {
      $sort: { matchCount: -1, createdAt: -1 },
    },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          {
            $addFields: {
              page,
              limit,
              totalPages: {
                $ceil: { $divide: ["$total", limit] },
              },
            },
          },
        ],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const result = await Story.aggregate(pipeline);

  const metadata = result[0].metadata[0] || {
    total: 0,
    page,
    limit,
    totalPages: 0,
  };
  const data = result[0].data;

   if (data.length > 0) {
        // 3️⃣ Collect all unique uploader IDs from the search results
        const uploaderIds = [...new Set(data.map(story => story.uploaded_by))];

        // 4️⃣ Fetch user info from PostgreSQL in one batch query
        const users = await User.findAll({
            where: { user_id: uploaderIds },
            attributes: ["user_id", "fullname", "username", "profilePhoto"],
            raw: true,
        });

        // Convert to a quick lookup map { user_id: user_object }
        const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));

        // 5️⃣ Merge user info into each story object
        data = data.map(story => ({
            ...story,
            uploaded_by_user: userMap[story.uploaded_by] || null,
        }));
    }

  return res.status(200).json(
    new ApiResponse(200, { stories: data, metadata }, "Stories fetched successfully")
  );
});



export {createStory,deleteStory,likeStory,unlikeStory,getFamilyStoriesAsc,
  getFamilyStoriesDesc,updateStory,getStory,getRecentStories,getUserRecentStories,searchStories}
