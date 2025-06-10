"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const router = (0, express_1.Router)();
// ✅ FIXED: Put specific routes BEFORE parameterized routes
router.get('/', profile_controller_1.ProfileController.getAllProfiles);
router.get('/search', profile_controller_1.ProfileController.searchProfiles); // Must come before /:id
router.get('/stats', profile_controller_1.ProfileController.getStats); // Must come before /:id
router.post('/scrape', profile_controller_1.ProfileController.scrapeLinkedInProfiles);
router.get('/:id', profile_controller_1.ProfileController.getProfileById); // Parameterized route comes last
router.delete('/:id', profile_controller_1.ProfileController.deleteProfile);
exports.default = router;
