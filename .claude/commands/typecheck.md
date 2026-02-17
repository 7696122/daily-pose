# TypeScript Type Check

Run TypeScript compiler to check type errors without building.

```bash
# Type check only
npx tsc --noEmit

# Type check with watch mode
npx tsc --noEmit --watch

# Type check specific file
npx tsc --noEmit src/components/CameraPage.tsx
```

## Type Safety Rules
- All files must have `.tsx` or `.ts` extension
- Implicit `any` is not allowed
- Strict null checks enabled
- All component props must be typed

Fix any type errors before committing.
