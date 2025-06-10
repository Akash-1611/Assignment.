"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_model_1 = require("../models/profile.model");
const linkedinScraper_service_1 = require("../services/linkedinScraper.service");
class ProfileController {
    // Get all profiles
    static async getAllProfiles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const skip = (page - 1) * limit;
            const profiles = await profile_model_1.Profile.find()
                .sort({ scrapedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            const total = await profile_model_1.Profile.countDocuments();
            res.json({
                success: true,
                data: profiles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            console.error('Error fetching profiles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profiles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get profile by ID
    static async getProfileById(req, res) {
        try {
            const { id } = req.params;
            const profile = await profile_model_1.Profile.findById(id);
            if (!profile) {
                res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
                return;
            }
            res.json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Search profiles
    static async searchProfiles(req, res) {
        try {
            const { query, company, location, jobTitle } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const searchFilter = {};
            if (query) {
                searchFilter.$or = [
                    { fullName: { $regex: query, $options: 'i' } },
                    { headline: { $regex: query, $options: 'i' } },
                    { about: { $regex: query, $options: 'i' } }
                ];
            }
            if (company) {
                searchFilter.company = { $regex: company, $options: 'i' };
            }
            if (location) {
                searchFilter.location = { $regex: location, $options: 'i' };
            }
            if (jobTitle) {
                searchFilter.jobTitle = { $regex: jobTitle, $options: 'i' };
            }
            const profiles = await profile_model_1.Profile.find(searchFilter)
                .sort({ scrapedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            const total = await profile_model_1.Profile.countDocuments(searchFilter);
            res.json({
                success: true,
                data: profiles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            console.error('Error searching profiles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search profiles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Scrape LinkedIn profiles
    static async scrapeLinkedInProfiles(req, res) {
        const scraper = new linkedinScraper_service_1.LinkedInScraperService();
        try {
            const { searchUrl, maxProfiles = 20 } = req.body;
            if (!searchUrl) {
                res.status(400).json({
                    success: false,
                    message: 'LinkedIn search URL is required'
                });
                return;
            }
            // Validate LinkedIn URL
            if (!searchUrl.includes('linkedin.com/search')) {
                res.status(400).json({
                    success: false,
                    message: 'Please provide a valid LinkedIn search URL'
                });
                return;
            }
            console.log('🚀 Starting LinkedIn scraping process...');
            // Initialize browser and login
            await scraper.initialize();
            const loginSuccess = await scraper.login();
            if (!loginSuccess) {
                await scraper.close();
                res.status(401).json({
                    success: false,
                    message: 'Failed to login to LinkedIn. Please check credentials.'
                });
                return;
            }
            // Scrape profiles
            const scrapedProfiles = await scraper.scrapeProfiles(searchUrl, maxProfiles);
            if (scrapedProfiles.length === 0) {
                await scraper.close();
                res.status(404).json({
                    success: false,
                    message: 'No profiles found for the given search URL'
                });
                return;
            }
            // Save to database
            const savedProfiles = [];
            for (const profileData of scrapedProfiles) {
                try {
                    // Check if profile already exists
                    const existingProfile = await profile_model_1.Profile.findOne({
                        linkedInURL: profileData.linkedInURL
                    });
                    if (!existingProfile) {
                        const newProfile = new profile_model_1.Profile(profileData);
                        const saved = await newProfile.save();
                        savedProfiles.push(saved.toObject());
                    }
                    else {
                        // Update existing profile
                        const updated = await profile_model_1.Profile.findByIdAndUpdate(existingProfile._id, { ...profileData, scrapedAt: new Date() }, { new: true });
                        if (updated)
                            savedProfiles.push(updated.toObject());
                    }
                }
                catch (saveError) {
                    console.error('Error saving profile:', saveError);
                    continue;
                }
            }
            const response = {
                success: true,
                message: `Successfully scraped ${savedProfiles.length} LinkedIn profiles`,
                profilesScraped: savedProfiles.length,
                profiles: savedProfiles
            };
            res.json(response);
        }
        catch (error) {
            console.error('Scraping error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to scrape LinkedIn profiles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        finally {
            await scraper.close();
        }
    }
    // Get scraping statistics
    static async getStats(req, res) {
        try {
            const totalProfiles = await profile_model_1.Profile.countDocuments();
            const companiesAgg = await profile_model_1.Profile.aggregate([
                { $group: { _id: '$company', count: { $sum: 1 } } },
                { $group: { _id: null, uniqueCompanies: { $sum: 1 } } }
            ]);
            const locationsAgg = await profile_model_1.Profile.aggregate([
                { $group: { _id: '$location', count: { $sum: 1 } } },
                { $group: { _id: null, uniqueLocations: { $sum: 1 } } }
            ]);
            const recentScrapesAgg = await profile_model_1.Profile.aggregate([
                {
                    $match: {
                        scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    }
                },
                { $count: 'recentScrapes' }
            ]);
            const topCompanies = await profile_model_1.Profile.aggregate([
                { $group: { _id: '$company', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);
            res.json({
                success: true,
                data: {
                    totalProfiles,
                    uniqueCompanies: companiesAgg[0]?.uniqueCompanies || 0,
                    uniqueLocations: locationsAgg[0]?.uniqueLocations || 0,
                    recentScrapes: recentScrapesAgg[0]?.recentScrapes || 0,
                    topCompanies
                }
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete profile
    static async deleteProfile(req, res) {
        try {
            const { id } = req.params;
            const deletedProfile = await profile_model_1.Profile.findByIdAndDelete(id);
            if (!deletedProfile) {
                res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Profile deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.ProfileController = ProfileController;
