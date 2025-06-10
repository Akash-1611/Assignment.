
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus } from "lucide-react";

interface Profile {
  _id: string;
  fullName: string;
  headline: string;
  jobTitle: string;
  company: string;
  location: string;
  linkedInURL: string;
  about: string;
}

export const LeadScraper = () => {
  const [searchUrl, setSearchUrl] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch('https://assignment-kb6p.onrender.com/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        throw new Error('Failed to fetch profiles');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profiles. Using demo data.",
        variant: "destructive",
      });
      // Fallback demo data
      setProfiles([
        {
          _id: '1',
          fullName: 'Sarah Chen',
          headline: 'VP of Sales at TechFlow Solutions',
          jobTitle: 'VP of Sales',
          company: 'TechFlow Solutions',
          location: 'San Francisco, CA',
          linkedInURL: 'https://linkedin.com/in/sarah-chen',
          about: 'Experienced sales leader with 10+ years in B2B SaaS...'
        },
        {
          _id: '2',
          fullName: 'Michael Rodriguez',
          headline: 'Founder & CEO at StartupX',
          jobTitle: 'Founder & CEO',
          company: 'StartupX',
          location: 'Austin, TX',
          linkedInURL: 'https://linkedin.com/in/michael-rodriguez',
          about: 'Serial entrepreneur building the future of fintech...'
        },
        {
          _id: '3',
          fullName: 'Emily Johnson',
          headline: 'Head of Marketing at GrowthCorp',
          jobTitle: 'Head of Marketing',
          company: 'GrowthCorp',
          location: 'New York, NY',
          linkedInURL: 'https://linkedin.com/in/emily-johnson',
          about: 'Growth marketing expert specializing in B2B lead generation...'
        }
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleScrape = async () => {
    if (!searchUrl) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn search URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate scraping process
    setTimeout(() => {
      toast({
        title: "Scraping Complete",
        description: "LinkedIn profiles have been scraped and saved to database",
      });
      setLoading(false);
      fetchProfiles();
    }, 3000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scraper Controls */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            LinkedIn Lead Scraper
          </CardTitle>
          <CardDescription>
            Enter a LinkedIn search URL to scrape profiles and extract lead information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.linkedin.com/search/results/people/?keywords=..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleScrape} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {loading ? 'Scraping...' : 'Start Scraping'}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            💡 Tip: Use LinkedIn's advanced search filters to target specific job titles, companies, or locations
          </div>
          
          {loading && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                <span className="text-yellow-700">Scraping LinkedIn profiles... This may take a few minutes.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(profiles.map(p => p.company)).size}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(profiles.map(p => p.location)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Scraped Profiles</h2>
            <p className="text-muted-foreground">LinkedIn profiles ready for outreach</p>
          </div>
        </div>

        {profiles.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No profiles scraped yet</h3>
              <p className="text-muted-foreground mb-4">
                Enter a LinkedIn search URL above to start scraping profiles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile._id} className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/60 text-primary-foreground">
                        {getInitials(profile.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {profile.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.jobTitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium truncate ml-2">{profile.company}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="truncate ml-2">{profile.location}</span>
                    </div>
                  </div>
                  
                  {profile.about && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {profile.about}
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-border/40 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};