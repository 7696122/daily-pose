interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  autoPlay?: boolean;
  playsInline?: boolean;
}

export const VideoPlayer = ({
  stream,
  muted = true,
  className = '',
  autoPlay = true,
  playsInline = true,
}: VideoPlayerProps) => {
  return (
    <video
      autoPlay={autoPlay}
      playsInline={playsInline}
      muted={muted}
      ref={(video) => {
        if (video && stream) {
          video.srcObject = stream;
        }
      }}
      className={`w-full h-full object-cover rounded-lg ${className}`}
    />
  );
};
