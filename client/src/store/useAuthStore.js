import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: localStorage.getItem('token') ? { username: localStorage.getItem('username') } : null,
  token: localStorage.getItem('token') || null,
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', userData.username);
    set({ user: userData, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ user: null, token: null });
  }
}));

export default useAuthStore;