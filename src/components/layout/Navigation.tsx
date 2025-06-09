
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: 'campaigns' | 'leads' | 'messages';
  onTabChange: (tab: 'campaigns' | 'leads' | 'messages') => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: '📊' },
    { id: 'leads', label: 'Lead Scraper', icon: '🎯' },
    { id: 'messages', label: 'AI Messages', icon: '🤖' },
  ] as const;

  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative transition-all duration-200",
            activeTab === tab.id && "shadow-sm"
          )}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </Button>
      ))}
    </div>
  );
};
