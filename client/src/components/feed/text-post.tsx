import PostActions from "./post-actions";

interface TextPostProps {
  post: any;
  isActive: boolean;
  onOpenComments: () => void;
}

export default function TextPost({ post, isActive, onOpenComments }: TextPostProps) {
  return (
    <div className="relative h-full w-full text-post-bg flex items-center justify-center">
      {/* Text Content Container */}
      <div className="max-w-lg mx-auto px-8 text-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            {post.content || "No content available"}
          </h2>
          {post.category && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm opacity-80">#{post.category}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Side Action Bar */}
      <PostActions 
        post={post} 
        onOpenComments={onOpenComments}
        variant="light" 
      />
      
      {/* Post Footer */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">@{post.username || 'unknown'}</span>
          <span className="text-sm opacity-80">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
