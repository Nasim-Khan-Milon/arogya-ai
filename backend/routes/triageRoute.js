import express from "express";
import {
  submitTriageSession,
  getTriageSessions,
} from "../controllers/triageController.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/submit", isAuthenticated, submitTriageSession);
router.get("/sessions", isAuthenticated, getTriageSessions);

export default router;

