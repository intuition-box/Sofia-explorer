import { useState } from "react";
import { Post } from "./Post";
import { CameraCapture } from "./CameraCapture";
import { Skeleton } from "./ui/skeleton";

interface PostData {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: {
    type: 'photo' | 'video';
    url: string;
  };
  space: string;
  timestamp: string;
  likes: number;
  hamstrings: number;
  isLiked: boolean;
  description?: string;
  chain?: PostData[];
}

interface FeedProps {
  activeSpace: string;
}

export function Feed({ activeSpace }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: '1',
      author: {
        name: 'Alex Chen',
        username: 'alexchen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      content: {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop'
      },
      space: 'shoes',
      timestamp: '2h',
      likes: 24,
      hamstrings: 3,
      isLiked: false,
      description: 'Fresh kicks for the weekend! 🔥',
      chain: [
        {
          id: '1a',
          author: {
            name: 'Sarah Kim',
            username: 'sarahk',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=100&h=100&fit=crop&crop=face'
          },
          content: {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop'
          },
          space: 'shoes',
          timestamp: '1h',
          likes: 12,
          hamstrings: 0,
          isLiked: true,
          description: 'Same vibes with my new ones! 👟'
        }
      ]
    },
    {
      id: '2',
      author: {
        name: 'Jordan Smith',
        username: 'jordansmith',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      content: {
        type: 'video',
        url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=500&fit=crop'
      },
      space: 'food',
      timestamp: '4h',
      likes: 56,
      hamstrings: 7,
      isLiked: true,
      description: 'Homemade pasta perfection 🍝',
    },
    {
      id: '3',
      author: {
        name: 'Maya Patel',
        username: 'mayapatel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      content: {
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop'
      },
      space: 'travel',
      timestamp: '6h',
      likes: 89,
      hamstrings: 12,
      isLiked: false,
      description: 'Mountain sunrise hits different ⛰️',
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const filteredPosts = activeSpace === 'all' 
    ? posts 
    : posts.filter(post => post.space === activeSpace);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleHamstring = (postId: string) => {
    // This would open a camera capture for creating a reply
    console.log('Creating hamstring for post:', postId);
  };

  const handleCapture = (content: { type: 'photo' | 'video', url: string, space: string }) => {
    const newPost: PostData = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: 'you',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
      },
      content,
      space: content.space,
      timestamp: 'now',
      likes: 0,
      hamstrings: 0,
      isLiked: false,
      description: 'Just captured this moment! ✨'
    };

    setPosts(prev => [newPost, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts in this space yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Be the first to share something!</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onHamstring={handleHamstring}
          />
        ))
      )}
      
      <CameraCapture onCapture={handleCapture} />
    </div>
  );
}