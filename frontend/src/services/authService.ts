import axios from 'axios';
import { User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.setAuthHeader(this.token);
    }
  }

  private setAuthHeader(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    this.token = token;
    this.setAuthHeader(token);
    return { token, user };
  }

  async register(username: string, email: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });
    const { token, user } = response.data;
    this.token = token;
    this.setAuthHeader(token);
    return { token, user };
  }

  async verifyToken(token: string): Promise<User> {
    this.setAuthHeader(token);
    const response = await axios.get(`${API_URL}/auth/verify`);
    return response.data.user;
  }

  logout() {
    this.token = null;
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();