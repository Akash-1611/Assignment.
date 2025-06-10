"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/campaign.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const CampaignSchema = new mongoose_1.default.Schema({
    name: String,
    description: String,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' },
    leads: [String],
    accountIDs: [String]
});
exports.default = mongoose_1.default.model('Campaign', CampaignSchema);
