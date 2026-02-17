# Run Linter

Run ESLint to check code quality and consistency.

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Lint specific file
npm run lint -- src/components/CameraPage.tsx
```

## ESLint Configuration
This project uses:
- `@eslint/js` - Latest ESLint configuration
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-react-refresh` - Fast refresh support

Fix any linting errors before committing.
