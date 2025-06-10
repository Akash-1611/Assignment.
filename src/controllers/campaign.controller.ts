
import { Request, Response } from 'express';
import Campaign from '../models/campaign.model';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const getCampaigns = async (req: Request, res: Response) => {
  const campaigns = await Campaign.find({ status: { $ne: 'DELETED' } });
  res.json(campaigns);
};

export const getCampaignById = async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);
  res.json(campaign);
};

export const createCampaign = async (req: Request, res: Response) => {
  const campaign = new Campaign(req.body);
  await campaign.save();
  res.status(201).json(campaign);
};

export const updateCampaign = async (req: Request, res: Response) => {
  const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteCampaign = async (req: Request, res: Response) => {
  await Campaign.findByIdAndUpdate(req.params.id, { status: 'DELETED' });
  res.json({ message: 'Campaign soft-deleted' });
};

export const generateMessage = async (req: Request, res: Response) => {
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

  } catch (err: any) {
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
