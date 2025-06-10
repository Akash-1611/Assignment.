
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export const MessageGenerator = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    jobTitle: '',
    company: '',
    location: '',
    summary: '',
  });
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!profileData.name || !profileData.jobTitle) {
      toast({
        title: "Error",
        description: "Please fill in at least name and job title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://assignment-kb6p.onrender.com/airoute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedMessage(data.message);
        toast({
          title: "Success",
          description: "Personalized message generated!",
        });
      } else {
        throw new Error('Failed to generate message');
      }
    } catch (error) {
      console.error('Error generating message:', error);
      // Fallback demo message
      const demoMessage = `Hey ${profileData.name}, I noticed you're working as a ${profileData.jobTitle} at ${profileData.company}. OutfloAI can help automate your LinkedIn outreach to increase meetings & sales. Would love to connect and show you how we can help streamline your lead generation process!`;
      setGeneratedMessage(demoMessage);
      toast({
        title: "Demo Mode",
        description: "Generated a demo message (API not connected)",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const exampleProfiles = [
    {
      name: "Sarah Chen",
      jobTitle: "VP of Sales",
      company: "TechFlow Solutions",
      location: "San Francisco, CA",
      summary: "Experienced sales leader with 10+ years in B2B SaaS"
    },
    {
      name: "Michael Rodriguez",
      jobTitle: "Founder & CEO",
      company: "StartupX",
      location: "Austin, TX",
      summary: "Serial entrepreneur building the future of fintech"
    }
  ];

  const loadExample = (example: typeof exampleProfiles[0]) => {
    setProfileData(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            🤖 AI Message Generator
          </CardTitle>
          <CardDescription>
            Generate personalized LinkedIn outreach messages using AI
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Enter the prospect's LinkedIn profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="TechCorp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Profile Summary</Label>
              <Textarea
                id="summary"
                value={profileData.summary}
                onChange={(e) => setProfileData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief description of their background and experience..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading || !profileData.name || !profileData.jobTitle}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Generating...' : 'Generate Message'}
            </Button>

            {/* Example Profiles */}
            <div className="pt-4 border-t border-border/40">
              <Label className="text-sm text-muted-foreground">Quick Examples:</Label>
              <div className="mt-2 space-y-2">
                {exampleProfiles.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example)}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {example.jobTitle} at {example.company}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Message */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Message</CardTitle>
            <CardDescription>
              AI-powered personalized LinkedIn message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!generatedMessage ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-muted-foreground">
                  Fill in the profile information and click "Generate Message" to create a personalized outreach message.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      ✨ AI Generated
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleCopyMessage}>
                      Copy Message
                    </Button>
                  </div>
                  
                  <Textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Message Analysis:</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Length:</div>
                      <div className="font-medium">{generatedMessage.length} characters</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Tone:</div>
                      <div className="font-medium">Professional & Friendly</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <Button className="w-full" variant="outline">
                    Add to Campaign
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Personalization</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Include specific company details</li>
                <li>• Reference recent achievements</li>
                <li>• Mention mutual connections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Keep messages under 300 characters</li>
                <li>• Include a clear call-to-action</li>
                <li>• A/B test different approaches</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
