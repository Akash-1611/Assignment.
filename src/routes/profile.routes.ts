import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

// ✅ FIXED: Put specific routes BEFORE parameterized routes
router.get('/', ProfileController.getAllProfiles);
router.get('/search', ProfileController.searchProfiles);  // Must come before /:id
router.get('/stats', ProfileController.getStats);         // Must come before /:id
router.post('/scrape', ProfileController.scrapeLinkedInProfiles);
router.get('/:id', ProfileController.getProfileById);     // Parameterized route comes last
router.delete('/:id', ProfileController.deleteProfile);

export default router;