
// This polyfill adds Node.js environment variables and globals to the window object
// for libraries that expect Node.js environments

// Add global to window
if (typeof window !== 'undefined') {
  // Fix for "global is not defined"
  window.global = window;
  
  // Fix for "process is not defined"
  window.process = window.process || {
    env: { NODE_ENV: 'production' }
  } as any;
  
  // Fix for "Buffer is not defined"
  window.Buffer = window.Buffer || {} as any;
  
  // Fix for moment-range requiring a global moment
  window.moment = window.moment || {} as any;
}

// Export a dummy function to ensure this file is imported
export default function ensurePolyfills() {
  // This is intentionally empty, just to ensure the side effects run
  return true;
}
