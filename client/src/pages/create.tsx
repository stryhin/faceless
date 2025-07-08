import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { ArrowLeft, Video, Image, Type, Upload, Sparkles } from "lucide-react";

type PostType = 'video' | 'image' | 'text';

export default function Create() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [postType, setPostType] = useState<PostType>('video');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && postType === 'text') {
      toast({
        title: "Error",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    if ((postType === 'video' || postType === 'image') && mediaFiles.length === 0) {
      toast({
        title: "Error",
        description: `Please select ${postType === 'video' ? 'a video' : 'images'} to upload.`,
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll create the post without actual file upload
    // In a real app, you'd upload files to a storage service first
    const postData = {
      type: postType,
      content: content.trim(),
      category: category || null,
      mediaUrls: mediaFiles.length > 0 ? ['https://via.placeholder.com/400x600'] : [],
    };

    createPostMutation.mutate(postData);
  };

  const categories = [
    { value: "real-talk", label: "Real Talk" },
    { value: "creative", label: "Creative" },
    { value: "storytime", label: "Storytime" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "education", label: "Education" },
  ];

  return (
    <div className="h-screen bg-faceless-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-faceless-gray">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-faceless-text p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Create Post</h2>
        <Button
          onClick={handlePublish}
          className="bg-faceless-accent hover:bg-faceless-accent/90 font-semibold"
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? "Publishing..." : "Post"}
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 pb-24">
        {/* Post Type Selection */}
        <div className="flex space-x-1 bg-faceless-gray rounded-lg p-1">
          <button
            onClick={() => setPostType('video')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${
              postType === 'video'
                ? 'bg-faceless-accent text-white'
                : 'text-faceless-text'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
          <button
            onClick={() => setPostType('image')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${
              postType === 'image'
                ? 'bg-faceless-accent text-white'
                : 'text-faceless-text'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Images</span>
          </button>
          <button
            onClick={() => setPostType('text')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${
              postType === 'text'
                ? 'bg-faceless-accent text-white'
                : 'text-faceless-text'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
        </div>

        {/* Media Upload Area */}
        {(postType === 'video' || postType === 'image') && (
          <div className="border-2 border-dashed border-faceless-gray rounded-lg h-64 flex flex-col items-center justify-center space-y-4">
            {postType === 'video' ? (
              <Video className="w-12 h-12 text-faceless-text" />
            ) : (
              <Image className="w-12 h-12 text-faceless-text" />
            )}
            <div className="text-center">
              <p className="text-lg font-medium">
                Upload {postType === 'video' ? 'a video' : 'images'}
              </p>
              <p className="text-sm text-faceless-text">
                {postType === 'video' ? 'Up to 10 minutes' : 'Up to 10 images'}
              </p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept={postType === 'video' ? 'video/*' : 'image/*'}
                multiple={postType === 'image'}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="bg-faceless-accent hover:bg-faceless-accent/90 text-white px-6 py-2 rounded-full font-medium">
                <Upload className="w-4 h-4 mr-2" />
                Choose File{postType === 'image' ? 's' : ''}
              </Button>
            </div>
            {mediaFiles.length > 0 && (
              <div className="text-sm text-faceless-text">
                {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}

        {/* Text Content for Text Posts */}
        {postType === 'text' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-faceless-gray border border-gray-600 rounded-lg p-4 text-white placeholder-faceless-text resize-none min-h-[200px]"
              placeholder="Share your thoughts..."
              maxLength={500}
            />
            <div className="text-right text-sm text-faceless-text">
              {content.length}/500
            </div>
          </div>
        )}

        {/* Caption Input */}
        {postType !== 'text' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Caption</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-faceless-gray border border-gray-600 rounded-lg p-3 text-white placeholder-faceless-text resize-none"
              rows={3}
              placeholder="Share your story..."
            />
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-faceless-gray border border-gray-600 text-white">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent className="bg-faceless-gray border-gray-600">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* AI Suggestions */}
        <div className="bg-faceless-gray rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-faceless-accent" />
            <span className="text-sm font-medium">AI Suggestions</span>
          </div>
          <div className="space-y-2">
            <button className="block w-full text-left text-sm text-faceless-text hover:text-white transition-colors">
              "Add trending hashtags for better reach"
            </button>
            <button className="block w-full text-left text-sm text-faceless-text hover:text-white transition-colors">
              "Consider posting during peak hours (6-9 PM)"
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation activeView="create" />
    </div>
  );
}
