const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  categoryId: string | Category;
  price: number;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string | User;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: Admin;
}

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User[]>(res);
  },
  create: async (data: Omit<User, '_id'>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Category[]>(res);
  },
  create: async (data: Omit<Category, '_id'>): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
  },
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Product[]>(res);
  },
  create: async (data: Omit<Product, '_id'>): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
  },
};

// Orders API
export const ordersAPI = {
  create: async (data: { userId: string; items: { productId: string; quantity: number }[] }): Promise<Order> => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Order>(res);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<DashboardStats>(res);
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(res);
  },

  getCurrentUser: async (): Promise<Admin> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse<Admin>(res);
  },
};

