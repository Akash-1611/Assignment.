import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash, Eye, Users, Target, Calendar, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onUpdate: () => void;
}

export const CampaignCard = ({ campaign, onUpdate }: CampaignCardProps) => {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const response = await fetch(`https://assignment-kb6p.onrender.com/campaigns/${campaign._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaign, status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
        toast({
          title: "Success",
          description: `Campaign ${newStatus.toLowerCase()} successfully!`,
        });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://assignment-kb6p.onrender.com/campaigns/${campaign._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
        setIsDetailsOpen(false);
        toast({
          title: "Success",
          description: "Campaign deleted successfully!",
        });
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const statusColor = {
    ACTIVE: 'bg-green-500/10 text-green-600 border-green-500/20',
    INACTIVE: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    DELETED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {campaign.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {campaign.description}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => handleStatusChange(campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                >
                  {campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'} Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColor[campaign.status]}>
              {campaign.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {campaign.leads.length} leads
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accounts:</span>
              <span className="font-medium">{campaign.accountIDs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Leads:</span>
              <span className="font-medium">{campaign.leads.length}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/40">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setIsDetailsOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Target className="w-5 h-5" />
              {campaign.name}
            </DialogTitle>
            <DialogDescription>
              Complete campaign details and statistics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={statusColor[campaign.status]} variant="outline">
                    {campaign.status}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Campaign ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {campaign._id}
                  </code>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {campaign.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.accountIDs.length}</div>
                  <p className="text-xs text-muted-foreground">Connected accounts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaign.leads.length}</div>
                  <p className="text-xs text-muted-foreground">Total leads</p>
                </CardContent>
              </Card>
            </div>

            {/* Account IDs */}
            {campaign.accountIDs.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Account IDs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {campaign.accountIDs.map((accountId, index) => (
                      <code key={index} className="text-xs bg-muted px-2 py-1 rounded block">
                        {accountId}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lead IDs */}
            {campaign.leads.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Lead IDs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {campaign.leads.map((leadId, index) => (
                      <code key={index} className="text-xs bg-muted px-2 py-1 rounded block">
                        {leadId}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created At
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(campaign.createdAt)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(campaign.updatedAt)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange(campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                className="flex-1"
              >
                {campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'} Campaign
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};