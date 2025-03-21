import { API_BASE_URL, getApiUrl } from './config';

interface RequestOptions extends RequestInit {
  token?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
  user_type?: string;
}

/**
 * Centralized function to make API requests
 */
export const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  console.log(`Sending ${options.method || 'GET'} request to: ${endpoint}`);
  
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  try {
    const url = getApiUrl(endpoint);
    console.log(`Full request URL: ${url}`);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    // For login endpoint, handle 401 differently to show the exact error from backend
    if (endpoint.includes('/auth/login/') && response.status === 401) {
      const errorData = await response.json();
      console.log(`Login failed. Server response:`, errorData);
      throw new Error(`Login failed: ${errorData.message || 'Invalid credentials'}`);
    }
    
    // Handle 401 Unauthorized (e.g., expired token)
    if (response.status === 401) {
      console.log('Unauthorized access - token might be expired');
      // Optionally redirect to login
      // window.location.href = '/login';
      throw new Error('Unauthorized access - please log in again');
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`Received non-JSON response: ${responseText.slice(0, 100)}...`);
      throw new Error('API did not return JSON data');
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API error ${response.status}: ${JSON.stringify(data)}`);
      throw new Error(`API request failed: ${data.detail || data.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error(`Request failed: ${error}`);
    throw error;
  }
};

/**
 * Public API endpoints (no authentication required)
 */
export const publicAPI = {
  getPublicTenders: () => apiRequest('/tenders/public'),
  getPublicTenderDetails: (tenderId: string) => apiRequest(`/tenders/public/${tenderId}`),
};

/**
 * Authentication API endpoints
 */
export const authAPI = {
  login: (credentials: LoginCredentials) => {
    console.log('Login request payload:', credentials);
    return apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  register: (userData: any) => 
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

/**
 * Protected Tender API endpoints (authentication required)
 */
export const tenderAPI = {
  getAllTenders: () => apiRequest('/tenders'),
  getTenderById: (tenderId: string) => apiRequest(`/tenders/${tenderId}`),
  createTender: (tenderData: any) => 
    apiRequest('/tenders', {
      method: 'POST',
      body: JSON.stringify(tenderData),
    }),
  updateTender: (tenderId: string, tenderData: any) => 
    apiRequest(`/tenders/${tenderId}`, {
      method: 'PUT',
      body: JSON.stringify(tenderData),
    }),
  deleteTender: (tenderId: string) => 
    apiRequest(`/tenders/${tenderId}`, {
      method: 'DELETE',
    }),
  updateTenderStatus: (tenderId: string, status: string) => 
    apiRequest(`/tenders/${tenderId}/update-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Protected Bid API endpoints (authentication required)
 */
export const bidAPI = {
  submitBid: (bidData: any) => 
    apiRequest('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    }),
  updateBid: (bidId: string, bidData: any) => 
    apiRequest(`/bids/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
    }),
  deleteBid: (bidId: string) => 
    apiRequest(`/bids/${bidId}`, {
      method: 'DELETE',
    }),
  getMyBids: () => apiRequest('/bids/my_bids'),
  getTenderBids: (tenderId: string) => apiRequest(`/tenders/${tenderId}/bids`),
  selectWinner: (bidId: string) => 
    apiRequest(`/bids/${bidId}/select_winner`, {
      method: 'POST',
    }),
}; 