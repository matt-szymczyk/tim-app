# Project Commands and Style Guide

## Build Commands
- Start dev server: `npx expo start`
- Run on Android: `npx expo run:android`
- Run on iOS: `npx expo run:ios`
- Run web version: `npx expo start --web`
- Run tests: `npm test`
- Run a single test: `jest --watch <testname>`
- Lint code: `npx expo lint`

## Code Style Guidelines
- **Typing**: Use TypeScript with strict mode. Define interfaces for props, states, and API responses.
- **Imports**: Group imports by: React, libraries, components, types/utilities.
- **File Structure**: React components and hooks in separate files, business logic in service files.
- **Naming**: PascalCase for components, camelCase for variables/functions, interfaces with 'I' prefix.
- **Error Handling**: Use try/catch with descriptive error messages. Handle API errors with proper user feedback.
- **Component Structure**: Props interface → useState/useEffect → helper functions → return JSX.
- **State Management**: Use React Context for app-wide state (see AuthContext pattern).
- **API Calls**: Abstract in service files with typed inputs/outputs.