"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
// src/models/profile.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const ProfileSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Pre-save middleware to handle empty strings
ProfileSchema.pre('save', function (next) {
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
exports.Profile = mongoose_1.default.model('Profile', ProfileSchema);
