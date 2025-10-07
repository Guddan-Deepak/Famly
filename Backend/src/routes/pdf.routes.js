import express from "express";
import { generateFamilyStoriesPDF } from "../controllers/pdf.controller.js";

const router = express.Router();

router.post("/", generateFamilyStoriesPDF);

export default router;
