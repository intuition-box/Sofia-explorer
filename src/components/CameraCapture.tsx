import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Camera, Video, X, Check } from "lucide-react";
import { Badge } from "./ui/badge";

interface CameraCaptureProps {
  onCapture: (content: { type: 'photo' | 'video', url: string, space: string }) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const spaces = [
    { id: 'shoes', name: 'Shoes', emoji: '👟' },
    { id: 'food', name: 'Food', emoji: '🍕' },
    { id: 'travel', name: 'Travel', emoji: '✈️' },
    { id: 'fitness', name: 'Fitness', emoji: '💪' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'art', name: 'Art', emoji: '🎨' },
    { id: 'tech', name: 'Tech', emoji: '📱' },
  ];

  const handleCapture = () => {
    // Simulate camera capture with placeholder content
    const mockUrl = captureMode === 'photo' 
      ? `https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=600&fit=crop`
      : `https://sample-videos.com/zip/10/mp4/mp4-placeholder.mp4`;
    
    setPreviewUrl(mockUrl);
  };

  const handlePost = () => {
    if (previewUrl) {
      onCapture({
        type: captureMode,
        url: previewUrl,
        space: selectedSpace
      });
      setIsOpen(false);
      setPreviewUrl(null);
      setSelectedSpace('all');
    }
  };

  const resetCapture = () => {
    setPreviewUrl(null);
    setIsRecording(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
          <Camera className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          {/* Camera preview area */}
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            {previewUrl ? (
              <div className="relative h-full">
                {captureMode === 'photo' ? (
                  <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                    <Video className="h-12 w-12" />
                    <span className="ml-2">Video Preview</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  onClick={resetCapture}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Camera className="h-12 w-12 mb-2" />
                <p>Camera preview would appear here</p>
                <p className="text-xs">Tap capture to simulate</p>
              </div>
            )}
          </div>

          {/* Capture mode toggle */}
          <div className="flex gap-2">
            <Button
              variant={captureMode === 'photo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCaptureMode('photo')}
            >
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={captureMode === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCaptureMode('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>

          {/* Space selection */}
          <div>
            <label className="text-sm mb-2 block">Choose a space:</label>
            <div className="flex flex-wrap gap-2">
              {spaces.map((space) => (
                <Badge
                  key={space.id}
                  variant={selectedSpace === space.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedSpace(space.id)}
                >
                  {space.emoji} {space.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {!previewUrl ? (
              <Button 
                onClick={handleCapture} 
                className="flex-1"
                disabled={isRecording}
              >
                {isRecording ? 'Recording...' : `Capture ${captureMode}`}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={resetCapture} className="flex-1">
                  Retake
                </Button>
                <Button onClick={handlePost} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}