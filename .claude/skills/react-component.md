# React Component Generator

Generate new React components following the project's Atomic Design pattern and conventions.

## When to Use
- Creating new UI components
- Refactoring existing components
- Adding features to components

## Component Template

```typescript
import { useState } from 'react';

interface ComponentNameProps {
  // Define props here
}

export function ComponentName({ prop }: ComponentNameProps) {
  const [state, setState] = useState(initialValue);

  return (
    <div className="">
      {/* Component JSX */}
    </div>
  );
}
```

## Guidelines
1. **Always** define prop interfaces explicitly
2. Use **PascalCase** for component names and file names
3. Place in appropriate Atomic Design folder:
   - `atoms/` - Basic UI elements (Button, Icon)
   - `molecules/` - Simple compositions (CameraButton, GalleryItem)
   - `organisms/` - Complex features (CameraPage, GalleryPage)
4. Use Tailwind CSS for styling
5. Export components using named exports

## React 19 Features
- Use `use()` for promises and context
- Use `useTransition()` for non-blocking UI
- Use `useOptimistic()` for optimistic updates

## Example Usage
```
Create a photo gallery item component with:
- Image thumbnail
- Date label
- Delete button
- Click to view full photo
```
