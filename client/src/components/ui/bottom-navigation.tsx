import { useLocation } from "wouter";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface BottomNavigationProps {
  activeView: string;
}

export default function BottomNavigation({ activeView }: BottomNavigationProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-faceless-black/90 nav-blur border-t border-faceless-gray z-50">
      <div className="flex items-center justify-around py-2">
        
        {/* Home */}
        <button 
          className="flex flex-col items-center py-2 px-3"
          onClick={() => navigate("/")}
        >
          <Home className={`text-xl w-6 h-6 ${activeView === 'home' ? 'text-white' : 'text-faceless-text'}`} />
          <span className="text-xs text-faceless-text mt-1">Home</span>
        </button>
        
        {/* Search */}
        <button 
          className="flex flex-col items-center py-2 px-3"
          onClick={() => {
            // TODO: Implement search functionality
          }}
        >
          <Search className={`text-xl w-6 h-6 ${activeView === 'search' ? 'text-white' : 'text-faceless-text'}`} />
          <span className="text-xs text-faceless-text mt-1">Search</span>
        </button>
        
        {/* Create */}
        <button 
          className="flex flex-col items-center py-2 px-3"
          onClick={() => navigate("/create")}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            activeView === 'create' ? 'bg-faceless-accent' : 'bg-faceless-accent'
          }`}>
            <Plus className="text-white text-lg w-5 h-5" />
          </div>
          <span className="text-xs text-faceless-text mt-1">Create</span>
        </button>
        
        {/* Subscriptions */}
        <button 
          className="flex flex-col items-center py-2 px-3"
          onClick={() => {
            // TODO: Implement subscriptions/updates view
          }}
        >
          <Bell className={`text-xl w-6 h-6 ${activeView === 'subscriptions' ? 'text-white' : 'text-faceless-text'}`} />
          <span className="text-xs text-faceless-text mt-1">Updates</span>
        </button>
        
        {/* Profile */}
        <button 
          className="flex flex-col items-center py-2 px-3"
          onClick={() => navigate("/profile")}
        >
          <div className="w-6 h-6 rounded-full border border-faceless-text overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Your profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-faceless-gray flex items-center justify-center">
                <User className="w-4 h-4 text-faceless-text" />
              </div>
            )}
          </div>
          <span className="text-xs text-faceless-text mt-1">Profile</span>
        </button>
        
      </div>
    </div>
  );
}
