// Central configuration for API URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const STORAGE_URL = process.env.REACT_APP_SUPABASE_URL + '/storage/v1/object/public/bid_documents';

// Log the API URL being used
console.log('Using API URL:', API_BASE_URL);

// Helper function to build API URLs
export const getApiUrl = (endpoint: string): string => {
  // Make sure the endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
}; 