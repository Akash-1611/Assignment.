// src/models/profile.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProfile } from '../types/profile.types';

export interface IProfileDocument extends IProfile, Document {}

const ProfileSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    headline: {
      type: String,
      required: false, // Changed to false
      default: 'Not specified',
      trim: true
    },
    jobTitle: {
      type: String,
      required: false, // Changed to false
      default: 'Not specified',
      trim: true,
      index: true
    },
    company: {
      type: String,
      required: false, // Changed to false
      default: 'Not specified',
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: false, // Changed to false
      default: 'Not specified',
      trim: true,
      index: true
    },
    linkedInURL: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    about: {
      type: String,
      default: '',
      trim: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    searchQuery: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to handle empty strings
ProfileSchema.pre<IProfileDocument>('save', function(next) {
  // Replace empty strings with default values
  if (!this.headline || this.headline.trim() === '') {
    this.headline = 'Not specified';
  }
  if (!this.jobTitle || this.jobTitle.trim() === '') {
    this.jobTitle = 'Not specified';
  }
  if (!this.company || this.company.trim() === '') {
    this.company = 'Not specified';
  }
  if (!this.location || this.location.trim() === '') {
    this.location = 'Not specified';
  }
  next();
});

// Compound indexes for better query performance
ProfileSchema.index({ company: 1, jobTitle: 1 });
ProfileSchema.index({ location: 1, company: 1 });
ProfileSchema.index({ scrapedAt: -1 });

export const Profile = mongoose.model<IProfileDocument>('Profile', ProfileSchema);