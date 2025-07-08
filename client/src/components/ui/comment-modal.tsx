import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, User } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
}

export default function CommentModal({ isOpen, onClose, postId }: CommentModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}/comments`],
    enabled: isOpen && !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/posts/${postId}/comments`] 
      });
      setCommentText("");
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
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to post comments.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate(commentText.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-faceless-black w-full max-h-96 rounded-t-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-faceless-gray">
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <button 
            className="text-faceless-text p-1"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Comments List */}
        <div className="max-h-64 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-faceless-text">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment: any) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {comment.profileImageUrl ? (
                    <img 
                      src={comment.profileImageUrl} 
                      alt={comment.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-faceless-gray flex items-center justify-center">
                      <User className="w-4 h-4 text-faceless-text" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-white">
                      @{comment.username || 'unknown'}
                    </span>
                    <span className="text-xs text-faceless-text">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-faceless-text mt-1">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-faceless-text">No comments yet</div>
          )}
        </div>
        
        {/* Comment Input */}
        <div className="p-4 border-t border-faceless-gray">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
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
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a comment..."
                className="flex-1 bg-faceless-gray border border-gray-600 rounded-full px-4 py-2 text-white placeholder-faceless-text text-sm"
                disabled={!isAuthenticated}
              />
              <Button
                onClick={handlePostComment}
                disabled={!commentText.trim() || createCommentMutation.isPending || !isAuthenticated}
                className="text-faceless-accent font-semibold text-sm bg-transparent hover:bg-faceless-gray px-3"
              >
                {createCommentMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
