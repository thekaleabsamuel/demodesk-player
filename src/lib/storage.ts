// Utility functions for media handling

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Extract YouTube video ID from URL
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  let videoId = '';
  
  // Extract video ID from various YouTube URL formats
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1]?.split('&')[0] || '';
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  
  return videoId || null;
};

// Convert YouTube URL to embed URL with proper formatting
export const convertYouTubeUrl = (url: string): string => {
  if (!url) return url;
  
  // If already an embed URL, return as is (but ensure proper params)
  if (url.includes('youtube.com/embed/')) {
    // Ensure it has proper parameters
    if (!url.includes('?')) {
      return `${url}?rel=0&modestbranding=1`;
    }
    return url;
  }
  
  const videoId = extractYouTubeVideoId(url);
  
  if (videoId) {
    // Return embed URL with proper parameters for thumbnail display
    // rel=0: Don't show related videos
    // modestbranding=1: Less YouTube branding
    // enablejsapi=1: Enable JS API for better control
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  }
  
  // If we can't parse it, return original
  return url;
};

// Get YouTube thumbnail URL
export const getYouTubeThumbnail = (url: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  
  // YouTube thumbnail URL format
  return `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : quality}default.jpg`;
};
