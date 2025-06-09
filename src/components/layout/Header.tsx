
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">OutfloAI</span>
            <Badge variant="secondary" className="ml-2">Pro</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="animate-pulse">
              🟢 Connected to LinkedIn
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
