import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id);
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        isCartOpen: true, // Automatically open cart when item is added
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }], isCartOpen: true };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  updateQuantity: (id, delta) => set((state) => {
    return {
      items: state.items.map((i) => {
        if (i.id === id) {
          const newQuantity = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    };
  }),
  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getCartTotal: () => get().items.reduce((total, item) => {
    const priceNumber = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
    return total + (priceNumber * item.quantity);
  }, 0),
}));

interface AuthStore {
  isLoggedIn: boolean;
  email: string;
  name: string;
  memberSince: string;
  setIsLoggedIn: (status: boolean) => void;
  setUser: (email: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  email: '',
  name: '',
  memberSince: '',
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setUser: (email, name) => set({
    isLoggedIn: true,
    email,
    name,
    memberSince: new Date().getFullYear().toString(),
  }),
  logout: () => set({ isLoggedIn: false, email: '', name: '', memberSince: '' }),
}));
