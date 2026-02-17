# Zustand Store Manager

Create and manage Zustand stores for state management in the Daily Pose app.

## When to Use
- Creating new stores
- Adding state to existing stores
- Creating selectors and actions
- Debugging store issues

## Store Template

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreNameState {
  // State properties
  items: Item[];
  isLoading: boolean;

  // Actions
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useStoreNameStore = create<StoreNameState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,

      // Actions
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'store-name-storage', // localStorage key
    }
  )
);
```

## Project Stores

### Photo Store
```typescript
interface PhotoState {
  photos: Photo[];
  currentPhoto: Photo | null;
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  setCurrentPhoto: (photo: Photo | null) => void;
}
```

### Camera Store
```typescript
interface CameraState {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  overlayOpacity: number;
  setCameraActive: (active: boolean) => void;
  toggleFacingMode: () => void;
  setOverlayOpacity: (opacity: number) => void;
}
```

### UI Store
```typescript
interface UIState {
  currentPage: 'camera' | 'gallery' | 'settings';
  theme: 'light' | 'dark';
  setCurrentPage: (page: UIState['currentPage']) => void;
  toggleTheme: () => void;
}
```

## Best Practices

### 1. Keep Stores Focused
One store per domain - don't put everything in one store.

### 2. Use Selectors
```typescript
// Good - Select only what you need
const photos = usePhotoStore((state) => state.photos);
const addPhoto = usePhotoStore((state) => state.addPhoto);

// Avoid - Select entire store
const store = usePhotoStore();
```

### 3. Immutability
Always create new objects/arrays - don't mutate directly.

```typescript
// Good - Spread operator
set((state) => ({ items: [...state.items, newItem] }));

// Bad - Mutation
set((state) => {
  state.items.push(newItem);
  return state;
});
```

### 4. Persist Middleware
Use for data that should survive page reloads (settings, photos).

```typescript
import { persist } from 'zustand/middleware';

export const useSettingsStore = create()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
```

### 5. DevTools
Add middleware for debugging in development.

```typescript
import { devtools } from 'zustand/middleware';

export const usePhotoStore = create()(
  devtools(
    (set) => ({
      photos: [],
      addPhoto: (photo) => set({ photos: [photo] }),
    }),
    { name: 'PhotoStore' }
  )
);
```

## File Naming
- Store files: `useXxxStore.ts`
- Example: `usePhotoStore.ts`, `useCameraStore.ts`, `useUISStore.ts`
