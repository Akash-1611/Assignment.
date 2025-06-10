"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = exports.getCampaignById = exports.getCampaigns = void 0;
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getCampaigns = async (req, res) => {
    const campaigns = await campaign_model_1.default.find({ status: { $ne: 'DELETED' } });
    res.json(campaigns);
};
exports.getCampaigns = getCampaigns;
const getCampaignById = async (req, res) => {
    const campaign = await campaign_model_1.default.findById(req.params.id);
    res.json(campaign);
};
exports.getCampaignById = getCampaignById;
const createCampaign = async (req, res) => {
    const campaign = new campaign_model_1.default(req.body);
    await campaign.save();
    res.status(201).json(campaign);
};
exports.createCampaign = createCampaign;
const updateCampaign = async (req, res) => {
    const updated = await campaign_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
};
exports.updateCampaign = updateCampaign;
const deleteCampaign = async (req, res) => {
    await campaign_model_1.default.findByIdAndUpdate(req.params.id, { status: 'DELETED' });
    res.json({ message: 'Campaign soft-deleted' });
};
exports.deleteCampaign = deleteCampaign;
const generateMessage = async (req, res) => {
    try {
        const { name, job_title, company, location, summary } = req.body;
        if (!name || !job_title || !company) {
            return res.status(400).json({
                error: 'Missing required fields: name, job_title, and company are required'
            });
        }
        const prompt = `Write a friendly LinkedIn outreach message for ${name}, a ${job_title} at ${company}, located in ${location || 'Unknown location'}. Summary: ${summary || 'No additional summary provided'}.`;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const message = response.text().trim();
        if (!message) {
            throw new Error('No message generated from Gemini');
        }
        res.json({ message });
    }
    catch (err) {
        console.error('Gemini API Error:', err);
        if (err.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again in a few minutes.',
                retryAfter: 60 // seconds
            });
        }
        if (err.status === 401) {
            return res.status(401).json({
                error: 'Invalid API key. Please check your GEMINI_API_KEY.',
            });
        }
        res.status(500).json({
            error: 'Failed to generate message',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
exports.generateMessage = generateMessage;
