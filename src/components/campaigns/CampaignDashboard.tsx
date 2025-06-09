
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { CampaignCard } from "./CampaignCard";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
}

export const CampaignDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns. Using demo data.",
        variant: "destructive",
      });
      // Fallback demo data
      setCampaigns([
        {
          _id: '1',
          name: 'Tech Startup Outreach',
          description: 'Reaching out to founders in the tech space',
          status: 'ACTIVE',
          leads: ['https://linkedin.com/in/profile-1', 'https://linkedin.com/in/profile-2'],
          accountIDs: ['123', '456']
        },
        {
          _id: '2',
          name: 'SaaS Decision Makers',
          description: 'Targeting CTOs and VPs at SaaS companies',
          status: 'ACTIVE',
          leads: ['https://linkedin.com/in/profile-3'],
          accountIDs: ['789']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns(prev => [...prev, newCampaign]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Campaign created successfully!",
    });
  };

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'ACTIVE').length,
    totalLeads: campaigns.reduce((sum, c) => sum + c.leads.length, 0),
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground">Manage your LinkedIn outreach campaigns</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">Create your first campaign to start reaching out to LinkedIn prospects</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} onUpdate={fetchCampaigns} />
          ))}
        </div>
      )}

      <CreateCampaignDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};
