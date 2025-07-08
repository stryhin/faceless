import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-faceless-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-faceless-gray border-gray-700">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Faceless</h1>
            <p className="text-xl text-faceless-accent font-medium">
              No Fame. Just Raw Content.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-faceless-text text-sm leading-relaxed">
              Experience social media without the vanity metrics. Share your authentic self,
              discover real content, and connect without the pressure of numbers.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-faceless-text">
                <div className="w-2 h-2 bg-faceless-accent rounded-full"></div>
                <span>No follower counts</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-faceless-text">
                <div className="w-2 h-2 bg-faceless-accent rounded-full"></div>
                <span>No like counters</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-faceless-text">
                <div className="w-2 h-2 bg-faceless-accent rounded-full"></div>
                <span>Pure, authentic content</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="w-full bg-faceless-accent hover:bg-faceless-accent/90 text-white font-medium py-3"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
