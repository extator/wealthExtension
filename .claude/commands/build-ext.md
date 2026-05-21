# Build Chrome Extension

Build the extension and prepare it for loading in Chrome.

## Instructions

1. Run the build:

```bash
npm run build
```

2. If the build fails, read the error output and fix the issues. Common problems:
   - TypeScript errors: check type imports and interface conformance
   - Missing dependencies: run `npm install`
   - Vite config issues: verify `vite.config.ts` has correct plugin setup

3. After successful build, report:

```
Build successful!

To load the extension in Chrome:
1. Open chrome://extensions/
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project

Extension output directory: ./dist/
```

4. If there were any build warnings, list them with suggestions for fixes.
