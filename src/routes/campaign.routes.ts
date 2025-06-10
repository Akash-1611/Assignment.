// src/routes/campaign.routes.ts
import express from 'express';
import * as controller from '../controllers/campaign.controller';
const router = express.Router();

router.get('/', controller.getCampaigns);
router.post('/', controller.createCampaign);
router.get('/:id', controller.getCampaignById);

router.put('/:id', controller.updateCampaign);
router.delete('/:id', controller.deleteCampaign);
// router.post('/generate-message', controller.generateMessage);

export default router;
