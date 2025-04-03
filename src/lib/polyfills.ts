
// This file contains polyfills needed by the application

// Set up global variables that might be missing in some environments
if (typeof window !== 'undefined') {
  // Polyfill for ResizeObserver if not available
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver is not supported in this browser. Some UI features may not work correctly.');
  }
  
  // Polyfill for IntersectionObserver if not available
  if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver is not supported in this browser. Some UI features may not work correctly.');
  }
  
  // Check if required global objects exist
  if (!window.process) {
    window.process = { env: {} } as any;
  }
  
  // Add global fetch polyfill if needed
  if (!window.fetch) {
    console.warn('Fetch API is not supported in this browser. API calls may not work correctly.');
  }
}

// Make sure this module is always imported first to ensure polyfills are applied
export {};
