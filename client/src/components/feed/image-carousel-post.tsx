import { useState } from "react";
import PostActions from "./post-actions";

interface ImageCarouselPostProps {
  post: any;
  isActive: boolean;
  onOpenComments: () => void;
}

export default function ImageCarouselPost({ post, isActive, onOpenComments }: ImageCarouselPostProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = post.mediaUrls || [];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-full w-full bg-faceless-gray">
      {/* Carousel Container */}
      <div className="relative h-full w-full overflow-hidden">
        {images.length > 0 ? (
          <div className="carousel-container flex h-full overflow-x-auto hide-scrollbar">
            {images.map((imageUrl: string, index: number) => (
              <div
                key={index}
                className={`carousel-item flex-shrink-0 w-full h-full relative ${
                  index === currentIndex ? 'block' : 'hidden'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-faceless-text">Images not available</div>
          </div>
        )}
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
            >
              →
            </button>
          </>
        )}
        
        {/* Carousel Indicators */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <div key={index} className="w-20 h-1 bg-white/60 rounded-full">
                <div
                  className={`h-full bg-white rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-full' : 'w-0'
                  }`}
                ></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
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
