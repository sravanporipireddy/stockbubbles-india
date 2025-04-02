
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
  
  // Remove the problematic moment polyfill - we don't need it for Finnhub
  // Finnhub doesn't depend on moment.js
}

// Make sure this module is always imported first to ensure polyfills are applied
export {};
