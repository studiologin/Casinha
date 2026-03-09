import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Category = "mercado" | "farmacia" | "pets" | "menu";

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
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ShoppingItem, "created_at">) => Promise<void>;
  toggleItem: (id: string, checked: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItemPrice: (id: string, price: number, isEstimated: boolean) => Promise<void>;
  editItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  reorderItems: (activeId: string, overId: string) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  isLoading: false,
  version: "1.0.1", // To verify deployment

  fetchItems: async () => {
    if (supabase.auth.getSession === undefined || (supabase as any).supabaseUrl?.includes("placeholder")) {
      console.error("❌ Supabase client is not configured correctly. Check your environment variables.");
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      set({ items: data as ShoppingItem[], isLoading: false });
    } else {
      set({ isLoading: false });
    }

    // Subscribe to changes
    supabase
      .channel("shopping_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        () => {
          get().fetchItems();
        }
      )
      .subscribe();
  },

  addItem: async (item) => {
    const { items } = get();
    const maxSortOrder = items.length > 0 ? Math.max(...items.map(i => (i as any).sort_order || 0)) : 0;

    if ((supabase as any).supabaseUrl?.includes("placeholder")) {
      console.error("❌ Cannot add item: Supabase is not configured.");
      return;
    }

    const { error } = await supabase.from("shopping_items").insert([{
      ...item,
      sort_order: maxSortOrder + 1,
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      console.error("❌ Supabase Error adding item:", error);
      throw error; // Let the caller handle it if needed
    }
  },

  toggleItem: async (id, checked) => {
    const { error } = await supabase
      .from("shopping_items")
      .update({ checked: !checked })
      .eq("id", id);

    if (error) console.error("Error toggling item:", error);
  },

  removeItem: async (id) => {
    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id);

    if (error) console.error("Error removing item:", error);
  },

  updateItemPrice: async (id, price, isEstimated) => {
    const { error } = await supabase
      .from("shopping_items")
      .update({
        estimated_price: price,
        price_is_estimated: isEstimated,
      })
      .eq("id", id);

    if (error) console.error("Error updating price:", error);
  },

  editItem: async (id, updates) => {
    const { error } = await supabase
      .from("shopping_items")
      .update(updates)
      .eq("id", id);

    if (error) console.error("Error editing item:", error);
  },

  reorderItems: async (activeId, overId) => {
    const { items } = get();
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      // Optimistic update
      set({ items: newItems });

      // Update all items' sort_order in Supabase
      // In a real app, we might just update the affected ones, but for a small list this is fine
      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from("shopping_items")
          .update({ sort_order: i })
          .eq("id", newItems[i].id);
      }
    }
  },
}));
