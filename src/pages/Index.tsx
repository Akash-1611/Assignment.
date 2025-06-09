
import { useState } from "react";
import { CampaignDashboard } from "@/components/campaigns/CampaignDashboard";
import { LeadScraper } from "@/components/leads/LeadScraper";
import { MessageGenerator } from "@/components/messages/MessageGenerator";
import { Navigation } from "@/components/layout/Navigation";
import { Header } from "@/components/layout/Header";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'leads' | 'messages'>('campaigns');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            LinkedIn Campaign Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Automate your LinkedIn outreach with intelligent campaign management
          </p>
        </div>
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-8">
          {activeTab === 'campaigns' && <CampaignDashboard />}
          {activeTab === 'leads' && <LeadScraper />}
          {activeTab === 'messages' && <MessageGenerator />}
        </div>
      </div>
    </div>
  );
};

export default Index;
