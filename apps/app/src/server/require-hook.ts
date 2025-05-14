// apps/app/src/server/require-hook.ts
import Module from 'module';

// Store the original require function
const originalRequire = Module.prototype.require;

// The part of the path we are looking for
// Example from user:
// /opt/growi/apps/app/node_modules/.pnpm/next@14.2.26_@babel+core@7.24.6_@opentelemetry+api@1.9.0
// ..._@playwright+test@1.49.1_react-_e7a1e3fbd8561cf0a63732392f0f7f15/node_modules/next/dist/compiled/webpack/bundle5.js
const targetModulePathPart = 'next/dist/compiled/webpack/bundle5.js';

console.log(`[RequireHookTS] Initializing hook to trace requires for modules containing: ${targetModulePathPart}`);

// Define the new require function
const newRequire = function(this: NodeModule, request: string): any {
  let resolvedPath = '';
  try {
    resolvedPath = (Module as any)._resolveFilename(request, this);
  }
  catch (e) {
    resolvedPath = request;
  }

  if (typeof resolvedPath === 'string' && resolvedPath.includes(targetModulePathPart)) {
    console.warn(`[RequireHookTS] MATCH: Module '${this.filename}' is attempting to require '${request}' (resolved to '${resolvedPath}')`);
    console.warn('[RequireHookTS] Stack trace for this require call:');
    console.warn(new Error().stack);
  }

  return originalRequire.call(this, request);
};

// Copy properties from originalRequire to newRequire to satisfy the type checker
// and ensure compatibility if other parts of the system rely on these properties.
Object.assign(newRequire, originalRequire);

// Override the require method on Module.prototype with our new function
Module.prototype.require = newRequire as NodeJS.Require;

console.log('[RequireHookTS] Hook is now ACTIVE.');

export const hookInitialized = true;
