# Tailwind CSS Styling Guide

Apply Tailwind CSS utility classes for styling in the Daily Pose app.

## When to Use
- Styling components
- Creating responsive layouts
- Adding dark mode support
- Creating animations

## Design Tokens (Tailwind v4+)
```css
/* In index.css - defined theme tokens */
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-family-sans: Inter, system-ui, sans-serif;
}
```

## Common Patterns

### Flexbox Layouts
```tsx
<div className="flex flex-col gap-4 p-4">
  {/* Vertical stack with gaps */}
</div>

<div className="flex items-center justify-between">
  {/* Horizontal, space between */}
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>
```

### Responsive Design
```tsx
{/* Mobile first approach */}
<div className="p-4 md:p-8 lg:p-12">
  {/* Padding increases on larger screens */}
</div>

<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Width changes by breakpoint */}
</div>
```

### Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Adapts to theme */}
</div>
```

### Camera/Photo Specific
```tsx
{/* Full screen camera overlay */}
<div className="absolute inset-0 pointer-events-none">
  {/* Overlay content */}
</div>

{/* Image container */}
<div className="aspect-video w-full overflow-hidden rounded-lg">
  <img className="w-full h-full object-cover" />
</div>

{/* Opacity control */}
<div className="opacity-50" style={{ opacity: overlayOpacity }}>
  {/* Adjustable transparency */}
</div>
```

### Buttons
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
  Capture
</button>
```

## Breakpoints
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

## Spacing Scale
- `p-4`: 1rem (16px)
- `gap-4`: 1rem gaps
- `m-auto`: auto margins

## State Variants
- `hover:` - Mouse over
- `active:` - Mouse pressed
- `focus:` - Keyboard focus
- `disabled:` - Disabled state
- `group-hover:` - Parent hover

## Animations
```tsx
<div className="animate-spin">
  {/* Spinning loader */}
</div>

<div className="transition-all duration-300 ease-in-out">
  {/* Smooth transitions */}
</div>
```

## Best Practices
1. Use utility classes for 95% of styling
2. Extract repeated patterns to component classes
3. Use `@apply` sparingly
4. Prefer composition over custom classes
5. Use semantic color names (not `text-red-500` for errors)
