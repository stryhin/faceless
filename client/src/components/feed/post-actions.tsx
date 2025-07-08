import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Bookmark, Share } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PostActionsProps {
  post: any;
  onOpenComments: () => void;
  variant?: 'dark' | 'light';
}

export default function PostActions({ post, onOpenComments, variant = 'dark' }: PostActionsProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: likeStatus } = useQuery({
    queryKey: [`/api/posts/${post.id}/like-status`],
    enabled: isAuthenticated,
  });

  const { data: saveStatus } = useQuery({
    queryKey: [`/api/posts/${post.id}/save-status`],
    enabled: isAuthenticated,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const method = likeStatus?.isLiked ? "DELETE" : "POST";
      return await apiRequest(method, `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/posts/${post.id}/like-status`] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const method = saveStatus?.isSaved ? "DELETE" : "POST";
      return await apiRequest(method, `/api/posts/${post.id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/posts/${post.id}/save-status`] 
      });
      toast({
        title: saveStatus?.isSaved ? "Unsaved" : "Saved",
        description: saveStatus?.isSaved 
          ? "Post removed from saved items." 
          : "Post saved successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update save status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.username}`,
        text: post.content || `Check out this post by @${post.username}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard.",
      });
    }
  };

  const buttonBg = variant === 'light' ? 'bg-white/20' : 'bg-faceless-gray';
  const heartColor = likeStatus?.isLiked ? 'text-red-500' : 'text-white';
  const bookmarkColor = saveStatus?.isSaved ? 'text-yellow-500' : 'text-white';

  return (
    <div className="absolute right-4 bottom-32 flex flex-col space-y-6 z-10">
      {/* Profile Picture */}
      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
        {post.profileImageUrl ? (
          <img 
            src={post.profileImageUrl} 
            alt="Creator profile" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-faceless-gray flex items-center justify-center">
            <span className="text-white font-bold">
              {post.username?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>
      
      {/* Like Button */}
      <button 
        className="flex flex-col items-center"
        onClick={() => likeMutation.mutate()}
        disabled={!isAuthenticated || likeMutation.isPending}
      >
        <div className={`w-12 h-12 ${buttonBg} rounded-full flex items-center justify-center`}>
          <Heart className={`text-xl w-6 h-6 ${heartColor} ${likeStatus?.isLiked ? 'fill-current' : ''}`} />
        </div>
      </button>
      
      {/* Comment Button */}
      <button 
        className="flex flex-col items-center"
        onClick={onOpenComments}
      >
        <div className={`w-12 h-12 ${buttonBg} rounded-full flex items-center justify-center`}>
          <MessageCircle className="text-white text-xl w-6 h-6" />
        </div>
      </button>
      
      {/* Save Button */}
      <button 
        className="flex flex-col items-center"
        onClick={() => saveMutation.mutate()}
        disabled={!isAuthenticated || saveMutation.isPending}
      >
        <div className={`w-12 h-12 ${buttonBg} rounded-full flex items-center justify-center`}>
          <Bookmark className={`text-xl w-6 h-6 ${bookmarkColor} ${saveStatus?.isSaved ? 'fill-current' : ''}`} />
        </div>
      </button>
      
      {/* Share Button */}
      <button 
        className="flex flex-col items-center"
        onClick={handleShare}
      >
        <div className={`w-12 h-12 ${buttonBg} rounded-full flex items-center justify-center`}>
          <Share className="text-white text-xl w-6 h-6" />
        </div>
      </button>
    </div>
  );
}
