// routes/content.routes.js
import express from "express";
import {
  createStory,
  deleteStory,
  likeStory,
  unlikeStory,
  getFamilyStoriesAsc,
  getFamilyStoriesDesc,
  updateStory,
  getStory,
  getRecentStories,
  getUserRecentStories,
  searchStories
} from "../controllers/content.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();




router.post(
  "/create-story/:family_id",
  verifyJWT,
  upload.array("mediaFiles", 10), // Accept up to 10 files
  createStory
);

router.get("/recent-story", verifyJWT, getRecentStories); // main homepage 


router.get("/user-recent-stories", verifyJWT, getUserRecentStories);

router.get("/recent-story", verifyJWT, getRecentStories);


router.get("/timeline-story", verifyJWT, getUserRecentStories);

router.delete("/delete/:storyId", verifyJWT, deleteStory);


router.post("/like/:storyId", verifyJWT, likeStory);
router.post("/unlike/:storyId", verifyJWT, unlikeStory);


router.get("/:storyId", verifyJWT, getStory);


router.put("/update/:storyId", verifyJWT, updateStory);
router.get("/search/:familyId",verifyJWT,searchStories)


router.get("/family/:familyId/asc", verifyJWT, getFamilyStoriesAsc);
router.get("/family/:familyId/desc", verifyJWT, getFamilyStoriesDesc);



router.get("/:family_id/search",searchStories);


export default router;
