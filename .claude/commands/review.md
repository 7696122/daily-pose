# Code Review

Review code changes for quality, security, and best practices.

## Review Checklist

### Code Quality
- [ ] Follows TypeScript best practices
- [ ] Component structure follows Atomic Design
- [ ] No unnecessary re-renders
- [ ] Proper error handling

### React Specific
- [ ] No missing dependencies in hooks
- [ ] Proper cleanup in useEffect
- [ ] Keys used correctly in lists
- [ ] State updates are immutable

### Performance
- [ ] No memory leaks (object URLs cleaned up)
- [ ] Large operations are debounced/throttled
- [ ] Lazy loading used where appropriate

### Accessibility
- [ ] Keyboard navigation works
- [ ] Proper ARIA labels
- [ ] Focus indicators visible

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] XSS prevention (React handles most)

Run this review after any significant changes.
