
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
}

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export const CreateCampaignDialog = ({ open, onOpenChange, onCampaignCreated }: CreateCampaignDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leads: [''],
    accountIDs: [''],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanedData = {
        ...formData,
        leads: formData.leads.filter(lead => lead.trim() !== ''),
        accountIDs: formData.accountIDs.filter(id => id.trim() !== ''),
      };

      const response = await fetch('http://localhost:5000/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        const newCampaign = await response.json();
        onCampaignCreated(newCampaign);
        setFormData({ name: '', description: '', leads: [''], accountIDs: [''] });
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayField = (field: 'leads' | 'accountIDs') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'leads' | 'accountIDs', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: 'leads' | 'accountIDs', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new LinkedIn outreach campaign with leads and account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Tech Startup Outreach"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your campaign objectives and target audience..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>LinkedIn Profile URLs</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => addArrayField('leads')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Lead
              </Button>
            </div>
            <div className="space-y-2">
              {formData.leads.map((lead, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={lead}
                    onChange={(e) => updateArrayField('leads', index, e.target.value)}
                    placeholder="https://linkedin.com/in/profile-username"
                    className="flex-1"
                  />
                  {formData.leads.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('leads', index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Account IDs</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => addArrayField('accountIDs')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Account
              </Button>
            </div>
            <div className="space-y-2">
              {formData.accountIDs.map((accountID, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={accountID}
                    onChange={(e) => updateArrayField('accountIDs', index, e.target.value)}
                    placeholder="Account ID (e.g., 123456)"
                    className="flex-1"
                  />
                  {formData.accountIDs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('accountIDs', index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.description}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
