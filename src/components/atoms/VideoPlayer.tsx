import { useRef, useEffect, forwardRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  autoPlay?: boolean;
  playsInline?: boolean;
  facingMode?: 'user' | 'environment';
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  stream,
  muted = true,
  className = '',
  autoPlay = true,
  playsInline = true,
  facingMode = 'user',
}, ref) => {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalRef;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
    } else {
      video.srcObject = null;
    }
  }, [stream, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      playsInline={playsInline}
      muted={muted}
      className={`w-full h-full object-cover rounded-lg ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${className}`}
    />
  );
});
