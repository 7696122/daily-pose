# Daily Pose - Claude Code Project Guide

## Project Overview

**Daily Pose** is a web application that allows users to take daily photos in the same pose and create timelapses.

- **Name**: Daily Pose
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, FFmpeg.wasm
- **Storage**: IndexedDB (browser-local)
- **Architecture**: Atomic Design Pattern

---

## Code Conventions

### TypeScript
- Use strict type checking - always prefer explicit types over `any`
- Define interfaces for component props, store state, and API responses
- Use type guards for runtime type checking
- Prefer `const` assertions for readonly data

```typescript
// Good
interface Photo {
  id: string;
  date: Date;
  blob: Blob;
  thumbnail: string;
}

// Bad
const photo: any = { ... };
```

### React 19
- Use function components with hooks
- Leverage React 19 features (use, useTransition, useOptimistic)
- Prefer composition over inheritance
- Keep components small and focused

```typescript
// Good - Single responsibility component
function CameraButton({ onCapture, disabled }: CameraButtonProps) {
  return <button onClick={onCapture} disabled={disabled}>Capture</button>;
}

// Bad - Multiple responsibilities
function Camera() {
  // Handles camera, storage, gallery, and export all in one
}
```

### Component Structure (Atomic Design)
```
src/components/
├── atoms/          # Basic UI elements (Button, Icon, Badge)
├── molecules/      # Simple compositions (CameraButton, GalleryItem)
└── organisms/      # Complex features (CameraPage, GalleryPage)
```

### State Management (Zustand)
- Use Zustand for global state (photos, camera status, settings)
- Keep stores focused - one store per domain
- Use selectors for derived state

```typescript
// Good - Focused store
const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  addPhoto: (photo) => set({ photos: [...get().photos, photo] }),
}));

// Bad - Everything in one store
const useAppStore = create<AppState>((set) => ({
  photos: [],
  camera: {},
  settings: {},
  ui: {},
  // ... 20 more properties
}));
```

### Styling (Tailwind CSS)
- Use utility classes for 95% of styling
- Extract repeated patterns to component-level classes
- Use Tailwind's `@apply` sparingly - prefer composition
- Follow responsive-first approach (mobile → desktop)

```typescript
// Good - Utility composition
<div className="flex flex-col gap-4 p-4 md:p-8 rounded-lg bg-white dark:bg-gray-800">

// Acceptable - Component class for complex patterns
<div className="camera-overlay">
// In index.css: .camera-overlay { @apply absolute inset-0 pointer-events-none; }
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `CameraButton.tsx`)
- Utilities: `camelCase.ts` (e.g., `dateFormatter.ts`)
- Types: `PascalCase.types.ts` (e.g., `Photo.types.ts`)
- Stores: `useXxxStore.ts` (e.g., `usePhotoStore.ts`)

---

## File Structure Rules

### Adding New Features
1. Create types first in `src/types/`
2. Add store state if needed in `src/stores/`
3. Create components following Atomic Design
4. Add utilities in `src/lib/` if reusable

### Import Order
```typescript
// 1. React & libraries
import { useState } from 'react';
import { useStore } from 'zustand';

// 2. Internal components
import { CameraButton } from '@/components/atoms/CameraButton';

// 3. Stores & utilities
import { usePhotoStore } from '@/stores/usePhotoStore';
import { formatDate } from '@/lib/dateFormatter';

// 4. Types
import type { Photo } from '@/types/Photo.types';

// 5. Styles & assets
import './PhotoGallery.css';
```

---

## Testing Guidelines

### Testing Priorities
1. **Camera logic** - Test photo capture and blob handling
2. **Storage operations** - Test IndexedDB interactions
3. **Video generation** - Test FFmpeg.wasm integration
4. **State management** - Test Zustand store actions

### Test Structure
```typescript
// Good - Descriptive test name
describe('usePhotoStore', () => {
  it('should add photo to store', () => {
    // Arrange
    const store = usePhotoStore.getState();

    // Act
    store.addPhoto(mockPhoto);

    // Assert
    expect(usePhotoStore.getState().photos).toHaveLength(1);
  });
});
```

---

## Build & Deployment

### Development
```bash
npm run dev     # Start dev server on http://localhost:5173
npm run lint    # Run ESLint
npm run build   # Production build
```

### Build Optimization
- Code splitting is handled by Vite automatically
- For lazy loading routes/components, use `React.lazy()`
- FFmpeg.wasm is loaded on-demand only

---

## Work Rules

### When Adding Features
1. **ALWAYS** read existing code before modifying
2. Ask for clarification if requirements are unclear
3. Prefer simple solutions over complex abstractions
4. Don't add features that weren't requested

### When Fixing Bugs
1. Understand the root cause before fixing
2. Add tests to prevent regression
3. Keep the fix minimal - don't refactor unrelated code

### When Refactoring
1. Only refactor if actively working on that area
2. Maintain backward compatibility
3. Update imports and references

---

## Project-Specific Notes

### Camera Features
- Webcam access via `navigator.mediaDevices.getUserMedia()`
- Photo capture creates Blob objects
- Overlay transparency is adjustable (0-100%)

### IndexedDB Storage
- Database name: `daily-pose-db`
- Store name: `photos`
- Indexed by `date` for chronological ordering

### FFmpeg.wasm
- Used for timelapse video generation
- Loads SharedArrayBuffer for multi-threading
- Requires proper COOP/COEP headers (configured in Vite)

### PWA Support
- Service Worker ready - can be installed as PWA
- Offline-first architecture possible
- Photos stored locally (no server required)

---

## Performance Considerations

- Lazy load FFmpeg.wasm (only when creating video)
- Use thumbnails in gallery, full photos on demand
- Debounce camera adjustments (exposure, focus)
- Clean up object URLs to prevent memory leaks

---

## Accessibility

- Camera capture button should be keyboard accessible
- Gallery items should have proper alt text or labels
- Video export should show progress feedback
- All interactive elements need focus states
