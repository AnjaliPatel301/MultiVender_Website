import { create } from 'zustand';
import { sellerAPI } from '../services/api';

export const useSellerStore = create((set, get) => ({
  seller: null,
  sellerUser: null,
  token: null,
  isLoading: false,
  isSellerAuthenticated: false,

  initSeller: () => {
    const token = localStorage.getItem('TECAISHOP_seller_token');
    const sellerStr = localStorage.getItem('TECAISHOP_seller');
    const sellerUserStr = localStorage.getItem('TECAISHOP_seller_user');
    if (token && sellerStr) {
      try {
        const seller = JSON.parse(sellerStr);
        const sellerUser = sellerUserStr ? JSON.parse(sellerUserStr) : null;
        set({ token, seller, sellerUser, isSellerAuthenticated: true });
      } catch { 
        localStorage.removeItem('TECAISHOP_seller_token');
        localStorage.removeItem('TECAISHOP_seller');
        localStorage.removeItem('TECAISHOP_seller_user');
      }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await sellerAPI.login(credentials);
      localStorage.setItem('TECAISHOP_seller_token', data.token);
      localStorage.setItem('TECAISHOP_seller', JSON.stringify(data.seller));
      localStorage.setItem('TECAISHOP_seller_user', JSON.stringify(data.user));
      set({ 
        seller: data.seller, 
        sellerUser: data.user, 
        token: data.token, 
        isSellerAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message, status: error.status };
    }
  },

  logout: () => {
    localStorage.removeItem('TECAISHOP_seller_token');
    localStorage.removeItem('TECAISHOP_seller');
    localStorage.removeItem('TECAISHOP_seller_user');
    set({ seller: null, sellerUser: null, token: null, isSellerAuthenticated: false });
  },

  updateSeller: (sellerData) => {
    const updated = { ...get().seller, ...sellerData };
    localStorage.setItem('TECAISHOP_seller', JSON.stringify(updated));
    set({ seller: updated });
  },
}));
