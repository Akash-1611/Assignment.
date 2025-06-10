// src/types/profile.types.ts
export interface IProfile {
  fullName: string;
  headline?: string; // Made optional
  jobTitle?: string; // Made optional
  company?: string; // Made optional
  location?: string; // Made optional
  linkedInURL: string;
  about?: string; // Made optional
  scrapedAt: Date;
  searchQuery?: string;
}

export interface ScrapeRequest {
  searchUrl: string;
  maxProfiles?: number;
}

export interface ScrapeResponse {
  success: boolean;
  message: string;
  profilesScraped: number;
  profiles?: IProfile[];
}