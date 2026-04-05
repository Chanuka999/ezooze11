
import { Product, Order, User, ContactMessage } from '../types';

// Use environment variable for API URL, fallback to localhost for development
let API_URL = 'http://localhost:5000/api';
let authToken: string | null = null;

try {
    const meta = (import.meta as any) || {};
    const env = meta.env || {};
    if (env.VITE_API_URL) {
        API_URL = env.VITE_API_URL;
    }
} catch (e) {
    // Keep default localhost URL if env access fails
}

// Helper function to create headers with auth token
const getHeaders = (contentType = 'application/json') => {
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// Helper function to handle API responses with better error messages
const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP ${response.status}`;
    const error = new Error(errorMessage) as any;
    error.response = { status: response.status, data };
    throw error;
  }
  
  return data;
};

export const dbClient = {
  // Set auth token for authenticated requests
  setAuthToken(token: string | null) {
    authToken = token;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  // Orders
  async createOrder(orderData: any): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  async getMyOrders(userId: string): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders/myorders?userId=${userId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Users
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },
  
  async register(name: string, email: string, pass: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password: pass }),
    });
    return handleResponse(response);
  },

  async signInWithGoogle(idToken: string, profile?: { email?: string; name?: string; picture?: string; googleId?: string }): Promise<User> {
    const response = await fetch(`${API_URL}/users/oauth/google`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ idToken, ...profile }),
    });
    return handleResponse(response);
  },

  async signInWithApple(idToken: string, profile?: { email?: string; name?: string; appleId?: string }): Promise<User> {
    const response = await fetch(`${API_URL}/users/oauth/apple`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ idToken, ...profile }),
    });
    return handleResponse(response);
  },
  
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    return handleResponse(response);
  },

  // Contact
  async submitContactForm(data: ContactMessage): Promise<ContactMessage> {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Payments
  async createPaymentIntent(amount: number, currency: string): Promise<{ clientSecret: string }> {
    const response = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount: Math.round(amount * 100), currency: currency.toLowerCase() }),
    });
    return handleResponse(response);
  }
};
