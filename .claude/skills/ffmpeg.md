# FFmpeg.wasm Helper

Handle video processing tasks using FFmpeg.wasm in the Daily Pose app.

## When to Use
- Creating timelapse videos from photos
- Converting video formats
- Adding effects to videos
- Video compression

## Key Considerations
1. **Lazy Loading** - FFmpeg.wasm is large (~25MB), load only when needed
2. **SharedArrayBuffer** - Requires proper COOP/COEP headers (configured in Vite)
3. **Progress Feedback** - Show user progress during processing
4. **Cleanup** - Always cleanup workers and blobs after use
5. **Error Handling** - Handle FFmpeg errors gracefully

## Loading FFmpeg

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// Load FFmpeg (call this when user clicks "Create Video")
async function loadFFmpeg() {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
}
```

## Creating Timelapse

```typescript
async function createTimelapse(photos: Blob[]) {
  // Write each photo
  for (let i = 0; i < photos.length; i++) {
    await ffmpeg.writeFile(`input${i}.jpg`, await fetchFile(photos[i]));
  }

  // Create video with 2 frames per second
  await ffmpeg.exec([
    '-framerate', '2',
    '-i', 'input%d.jpg',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '23',
    'output.mp4'
  ]);

  // Read output
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
}
```

## Progress Tracking

```typescript
ffmpeg.on('log', ({ message }) => {
  console.log('FFmpeg:', message);
});

ffmpeg.on('progress', ({ progress }) => {
  console.log('Progress:', Math.round(progress * 100) + '%');
});
```

## Cleanup

```typescript
// After processing
async function cleanup() {
  // Remove input files
  for (let i = 0; i < photoCount; i++) {
    await ffmpeg.deleteFile(`input${i}.jpg`);
  }
  await ffmpeg.deleteFile('output.mp4');

  // Terminate worker
  await ffmpeg.terminate();
}
```

## Common Issues
- **Cross-origin isolation** - Ensure Vite config has proper headers
- **Memory** - Processing many photos may use lots of memory
- **Time** - Video creation can take time, show loading indicator
