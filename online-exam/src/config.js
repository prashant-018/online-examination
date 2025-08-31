// Comprehensive configuration for Online Exam System
// Automatically switches between development and production environments

// Use a module pattern to prevent multiple declarations
const createConfig = () => {
  // Check if config already exists in global scope
  if (typeof window !== 'undefined' && window.__ONLINE_EXAM_CONFIG__) {
    return window.__ONLINE_EXAM_CONFIG__;
  }

  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

  // Development configuration
  const DEV_CONFIG = {
    // Backend URLs - try multiple ports in case of conflicts
    BACKEND_URLS: [
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5002',
      'http://localhost:5003'
    ],
    FRONTEND_URL: 'http://localhost:5173',
    API_BASE: null, // Will be set dynamically
    ENVIRONMENT: 'development'
  };

  // Production configuration
  const PROD_CONFIG = {
    BACKEND_URL: 'https://online-examination-4-nqz9.onrender.com',
    FRONTEND_URL: 'https://onlineexaam.netlify.app',
    API_BASE: 'https://online-examination-4-nqz9.onrender.com',
    ENVIRONMENT: 'production'
  };

  // CORS allowed origins for backend - only declared once
  const CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174', // Handle port conflicts
    'http://localhost:5175',
    'https://onlineexaam.netlify.app',
    'https://online-examination-4-nqz9.onrender.com'
  ];

  // Netlify preview domain pattern
  const NETLIFY_PREVIEW_PATTERN = /^https:\/\/.*--onlineexaam\.netlify\.app$/;

  // Function to test backend connectivity
  const testBackendConnection = async (url) => {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Function to find working backend URL
  const findWorkingBackend = async () => {
    for (const url of DEV_CONFIG.BACKEND_URLS) {
      if (await testBackendConnection(url)) {
        return url;
      }
    }
    // Fallback to first URL if none work
    return DEV_CONFIG.BACKEND_URLS[0];
  };

  // Initialize configuration
  let config;

  if (isDevelopment) {
    // Development mode - will be initialized asynchronously
    config = {
      ...DEV_CONFIG,
      API_BASE: DEV_CONFIG.BACKEND_URLS[0], // Default fallback
      async initialize() {
        this.API_BASE = await findWorkingBackend();
        console.log('🌍 Environment: Development');
        console.log('🌍 API_BASE loaded:', this.API_BASE);
        console.log('🌍 Frontend URL:', this.FRONTEND_URL);
        return this;
      }
    };
  } else {
    // Production mode
    config = {
      ...PROD_CONFIG,
      async initialize() {
        console.log('🌍 Environment: Production');
        console.log('🌍 API_BASE loaded:', this.API_BASE);
        console.log('🌍 Frontend URL:', this.FRONTEND_URL);
        return this;
      }
    };
  }

  // Create the final config object with all exports
  const finalConfig = {
    ...config,
    CORS_ORIGINS,
    NETLIFY_PREVIEW_PATTERN,
    isDev: () => isDevelopment,
    isProd: () => !isDevelopment,
    getBackendConfig: () => ({
      corsOrigins: CORS_ORIGINS,
      netlifyPreviewPattern: NETLIFY_PREVIEW_PATTERN,
      isDevelopment: isDevelopment
    })
  };

  // Store in global scope to prevent multiple declarations (browser-safe)
  if (typeof window !== 'undefined') {
    window.__ONLINE_EXAM_CONFIG__ = finalConfig;
  }

  return finalConfig;
};

// Create the configuration instance
const config = createConfig();

// Export configuration
export default config;

// Export individual values for convenience
export const API_BASE = config.API_BASE;
export const ENVIRONMENT = config.ENVIRONMENT;
export const CORS_ORIGINS = config.CORS_ORIGINS;
export const NETLIFY_PREVIEW_PATTERN = config.NETLIFY_PREVIEW_PATTERN;

// Export utility functions
export const isDev = config.isDev;
export const isProd = config.isProd;

// Export for backend use (if needed)
export const getBackendConfig = config.getBackendConfig;


