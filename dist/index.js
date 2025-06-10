"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const campaign_routes_1 = __importDefault(require("./routes/campaign.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/campaigns', campaign_routes_1.default);
app.use('/airoute', ai_routes_1.default);
app.use('/api/profiles', profile_routes_1.default);
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
})
    .catch(err => console.error('DB Connection Error:', err));
