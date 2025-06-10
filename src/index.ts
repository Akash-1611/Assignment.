// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import campaignRoutes from './routes/campaign.routes';
import airoutes from './routes/ai.routes';
import profileRoutes from './routes/profile.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/campaigns', campaignRoutes);
app.use('/airoute',airoutes);
app.use('/api/profiles',profileRoutes)
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => console.error('DB Connection Error:', err));
