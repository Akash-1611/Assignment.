
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
}

interface CampaignCardProps {
  campaign: Campaign;
  onUpdate: () => void;
}

export const CampaignCard = ({ campaign, onUpdate }: CampaignCardProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const response = await fetch(`http://localhost:5000/campaigns/${campaign._id}`, {
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
      const response = await fetch(`http://localhost:5000/campaigns/${campaign._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
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

  return (
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
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
