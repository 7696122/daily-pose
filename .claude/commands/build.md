# Production Build

Create an optimized production build of the Daily Pose app.

```bash
# Run TypeScript check and build
npm run build

# Preview the production build
npm run preview
```

## Build Checklist
- [ ] TypeScript compilation passes
- [ ] All imports resolve correctly
- [ ] No console errors or warnings
- [ ] Assets are properly bundled
- [ ] FFmpeg.wasm loads correctly

## Post-Build
- Check `dist/` folder size
- Test the preview build locally
- Verify PWA manifest is included
