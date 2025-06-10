import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post('/', async (req, res) => {
  try {
    // Fixed: Use camelCase to match frontend
    const { name, jobTitle, company, location, summary } = req.body;

    if (!name || !jobTitle) {
      return res.status(400).json({
        error: 'Missing required fields: name and jobTitle are required'
      });
    }

    const prompt = `Write a friendly LinkedIn outreach message for ${name}, a ${jobTitle}${company ? ` at ${company}` : ''}${location ? `, located in ${location}` : ''}. ${summary ? `Additional context: ${summary}` : ''}

Make it personalized, professional, and include a clear value proposition about how OutfloAI can help with LinkedIn outreach automation and lead generation. Keep it concise and engaging.`;

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
        
    // Handle rate limit specifically
    if (err.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a few minutes.',
        retryAfter: 60
      });
    }

    // Handle quota exceeded
    if (err.message?.includes('quota') || err.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please check your Gemini API usage.',
      });
    }

    res.status(500).json({
      error: 'Failed to generate message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;