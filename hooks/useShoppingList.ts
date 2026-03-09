import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Category = "mercado" | "farmacia" | "pets";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: Category;
  estimated_price?: number;
  price_is_estimated: boolean;
  checked: boolean;
  added_by: "Manoel" | "Nucha";
  created_at: string;
}

interface ShoppingState {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, "created_at">) => string;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateItemPrice: (id: string, price: number, isEstimated: boolean) => void;
  reorderItems: (activeId: string, overId: string) => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              created_at: new Date().toISOString(),
            },
          ],
        }));
        return item.id;
      },
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item,
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateItemPrice: (id, price, isEstimated) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  estimated_price: price,
                  price_is_estimated: isEstimated,
                }
              : item,
          ),
        })),
      reorderItems: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.items.findIndex((i) => i.id === activeId);
          const newIndex = state.items.findIndex((i) => i.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const newItems = [...state.items];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            return { items: newItems };
          }
          return state;
        }),
    }),
    {
      name: "casinha-shopping-storage",
    },
  ),
);
