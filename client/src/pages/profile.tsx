import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { ArrowLeft, Play, Image } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profileUserId = userId || currentUser?.id;

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: [`/api/auth/user`],
    enabled: isOwnProfile,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: [`/api/users/${profileUserId}/posts`],
    enabled: !!profileUserId,
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/users/${profileUserId}/subscription-status`],
    enabled: !isOwnProfile && !!profileUserId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const method = subscriptionStatus?.isSubscribed ? "DELETE" : "POST";
      return await apiRequest(method, `/api/users/${profileUserId}/subscribe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${profileUserId}/subscription-status`] 
      });
      toast({
        title: subscriptionStatus?.isSubscribed ? "Unsubscribed" : "Subscribed",
        description: subscriptionStatus?.isSubscribed 
          ? "You have unsubscribed from this user." 
          : "You are now subscribed to this user.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const user = isOwnProfile ? profileUser || currentUser : profileUser;

  if (userLoading) {
    return (
      <div className="h-screen bg-faceless-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({
      username: user?.username || "",
      bio: user?.bio || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  return (
    <div className="h-screen bg-faceless-black text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-faceless-gray">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-white p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {isOwnProfile ? "Profile" : `@${user?.username}`}
        </h1>
        <div className="w-9" />
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Profile Background */}
        <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Profile Picture */}
          <div className="relative -mt-16 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-faceless-gray overflow-hidden bg-faceless-gray">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-faceless-gray flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* User Details */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  className="bg-faceless-gray border-gray-600 text-white placeholder-gray-400"
                />
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Bio"
                  className="bg-faceless-gray border-gray-600 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    className="bg-faceless-accent hover:bg-faceless-accent/90 text-white"
                    style={{ backgroundColor: 'hsl(348, 100%, 61%)' }}
                    disabled={updateProfileMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-white">@{user?.username || "Unknown"}</h1>
                <p className="text-gray-300 mt-2">
                  {user?.bio || "No bio available"}
                </p>
              </div>
            )}
            
            {/* Action Button */}
            {isOwnProfile ? (
              !isEditing && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="border-gray-600 text-white"
                >
                  Edit Profile
                </Button>
              )
            ) : (
              <Button
                onClick={() => subscribeMutation.mutate()}
                className={`font-medium text-white ${
                  subscriptionStatus?.isSubscribed
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-faceless-accent hover:bg-faceless-accent/90"
                }`}
                style={!subscriptionStatus?.isSubscribed ? { backgroundColor: 'hsl(348, 100%, 61%)' } : {}}
                disabled={subscribeMutation.isPending}
              >
                {subscriptionStatus?.isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="px-1 pb-20">
        {postsLoading ? (
          <div className="text-center py-8">
            <div className="text-faceless-text">Loading posts...</div>
          </div>
        ) : posts.length > 0 ? (
          <div className="profile-grid">
            {posts.map((post: any) => (
              <div
                key={post.id}
                className="aspect-square bg-faceless-gray relative overflow-hidden cursor-pointer"
                onClick={() => {
                  // Navigate to post or open modal
                }}
              >
                {post.type === 'video' && post.mediaUrls?.[0] ? (
                  <>
                    <video className="w-full h-full object-cover">
                      <source src={post.mediaUrls[0]} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Play className="absolute top-2 right-2 text-white w-4 h-4" />
                  </>
                ) : post.type === 'image' && post.mediaUrls?.[0] ? (
                  <>
                    <img 
                      src={post.mediaUrls[0]} 
                      alt="Post" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    {post.mediaUrls.length > 1 && (
                      <Image className="absolute top-2 right-2 text-white w-4 h-4" />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
                    <p className="text-white text-xs text-center font-medium line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-faceless-text">No posts yet</div>
          </div>
        )}
      </div>

      <BottomNavigation activeView="profile" />
    </div>
  );
}
