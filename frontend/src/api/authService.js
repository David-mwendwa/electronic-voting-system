// In authService.js
import api from './apiClient';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      // Store token in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');

      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] =
        `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    // If registration is successful, store the token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      api.defaults.headers.common['Authorization'] =
        `Bearer ${response.data.token}`;
    }

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Registration successful!',
    };
  } catch (error) {
    // Extract error message from response or use a default message
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Registration failed. Please try again.';

    // Log the error for debugging
    console.error('Registration error:', error.response?.data || error);

    // Return error details
    return {
      success: false,
      message: errorMessage,
      errors: error.response?.data?.errors || null,
      status: error.response?.status,
    };
  }
};

export const logout = async () => {
  try {
    // Call the backend logout endpoint if needed
    await api.get('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};
