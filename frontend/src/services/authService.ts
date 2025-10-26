// src/services/authService.ts
export const authService = {
  async login(email: string, password: string) {
    return { 
      user: { id: '1', username: 'demo', email, role: 'user', statistics: {}, createdAt: new Date() },
      token: 'demo-token'
    };
  },
  async register(username: string, email: string, password: string) {
    return this.login(email, password);
  },
  async verifyToken(token: string) {
    return { id: '1', username: 'demo', email: 'demo@example.com', role: 'user', statistics: {}, createdAt: new Date() };
  }
};
