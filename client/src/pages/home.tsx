import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import VideoPost from "@/components/feed/video-post";
import ImageCarouselPost from "@/components/feed/image-carousel-post";
import TextPost from "@/components/feed/text-post";
import BottomNavigation from "@/components/ui/bottom-navigation";
import CommentModal from "@/components/ui/comment-modal";

export default function Home() {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY > 0 && currentPostIndex < posts.length - 1) {
        setCurrentPostIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentPostIndex > 0) {
        setCurrentPostIndex(prev => prev - 1);
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentPostIndex, posts.length]);

  const handleOpenComments = (postId: number) => {
    setSelectedPostId(postId);
    setCommentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-faceless-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-faceless-black relative overflow-hidden">
      <div className="h-full overflow-y-auto post-container hide-scrollbar">
        {posts.map((post: any, index: number) => (
          <div key={post.id} className="post-item h-screen w-full">
            {post.type === 'video' && (
              <VideoPost
                post={post}
                isActive={index === currentPostIndex}
                onOpenComments={() => handleOpenComments(post.id)}
              />
            )}
            {post.type === 'image' && (
              <ImageCarouselPost
                post={post}
                isActive={index === currentPostIndex}
                onOpenComments={() => handleOpenComments(post.id)}
              />
            )}
            {post.type === 'text' && (
              <TextPost
                post={post}
                isActive={index === currentPostIndex}
                onOpenComments={() => handleOpenComments(post.id)}
              />
            )}
          </div>
        ))}
      </div>

      <BottomNavigation activeView="home" />

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        postId={selectedPostId}
      />
    </div>
  );
}
