
// This polyfill adds 'global' to the window object for libraries that expect Node.js environments
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  (window as any).global = window;
}
