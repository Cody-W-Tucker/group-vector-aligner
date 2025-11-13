# Agent Guidelines for Group Vector Aligner

## Commands
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Dev**: `npm run dev`
- **Start**: `npm run start`
- **Test**: No tests configured yet

## Code Style
- **TypeScript**: Strict mode enabled, explicit types required
- **Imports**: External libraries first, then internal with `@/` paths
- **Components**: PascalCase, functional with hooks, forwardRef when needed
- **Functions**: camelCase, async/await pattern
- **Error Handling**: try/catch with graceful degradation, unknown type checking
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Comments**: Minimal, only for complex logic
- **Server Actions**: Use `'use server'` directive, place in `lib/actions.ts`
- **UI Components**: Use shadcn/ui, class-variance-authority for variants
- **Styling**: Tailwind CSS with cn() utility for class merging

## Conventions
- No emojis in code
- No console.log in production code (remove after debugging)
- Prefer server components, use 'use client' only when necessary
- Type all function parameters and return values
- Use React.ComponentPropsWithoutRef for component props
- Handle loading/error states in forms and async operations