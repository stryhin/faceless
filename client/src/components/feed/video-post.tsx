import { useRef, useEffect } from "react";
import PostActions from "./post-actions";

interface VideoPostProps {
  post: any;
  isActive: boolean;
  onOpenComments: () => void;
}

export default function VideoPost({ post, isActive, onOpenComments }: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Video */}
      {post.mediaUrls?.[0] ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          autoPlay={isActive}
          loop
          muted
          onClick={handleVideoClick}
        >
          <source src={post.mediaUrls[0]} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-faceless-gray flex items-center justify-center">
          <div className="text-faceless-text">Video not available</div>
        </div>
      )}
      
      {/* Video overlay gradient */}
      <div className="absolute inset-0 video-overlay"></div>
      
      {/* Side Action Bar */}
      <PostActions post={post} onOpenComments={onOpenComments} />
      
      {/* Post Caption */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg">@{post.username || 'unknown'}</span>
            {post.category && (
              <span className="text-sm text-faceless-text">#{post.category}</span>
            )}
          </div>
          {post.content && (
            <p className="text-sm leading-relaxed">{post.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
