import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Category = "mercado" | "farmacia" | "pets" | "menu" | "historico";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: Exclude<Category, "historico">;
  estimated_price?: number;
  price_is_estimated: boolean;
  checked: boolean;
  added_by: "Manoel" | "Nucha";
  created_at: string;
}

export interface SavedList {
  id: string;
  name: string;
  category: Exclude<Category, "historico">;
  created_at: string;
}

export interface SavedListItem {
  id: string;
  list_id: string;
  name: string;
  quantity: string;
  unit: string;
  price?: number;
  created_at: string;
}

interface ShoppingState {
  items: ShoppingItem[];
  savedLists: SavedList[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ShoppingItem, "created_at">) => Promise<void>;
  toggleItem: (id: string, checked: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItemPrice: (id: string, price: number, isEstimated: boolean) => Promise<void>;
  editItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  reorderItems: (activeId: string, overId: string) => Promise<void>;
  // History functions
  saveCurrentList: (name: string, category: Exclude<Category, "historico">) => Promise<void>;
  fetchSavedLists: () => Promise<void>;
  fetchSavedListItems: (listId: string) => Promise<SavedListItem[]>;
  reuseItem: (item: Partial<SavedListItem>, category: Exclude<Category, "historico">) => Promise<void>;
  deleteSavedList: (listId: string) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  savedLists: [],
  isLoading: false,
  version: "1.0.3", // Added history

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

    // Subscribe to changes only once
    const channels = supabase.getChannels();
    const hasSubscription = channels.some(ch => ch.topic === 'realtime:public:shopping_items' || ch.topic === 'shopping_items_changes');

    if (!hasSubscription) {
      supabase
        .channel("shopping_items_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "shopping_items" },
          (payload) => {
            console.log("Realtime update received:", payload);
            // Instead of fetching all, we could update the state based on payload
            // But for simplicity and sorting correctness, fetchItems works for now
            // Small optimization: only fetch if not an optimistic update we just did
            get().fetchItems();
          }
        )
        .subscribe();
    }
  },

  addItem: async (item) => {
    const { items } = get();
    const maxSortOrder = items.length > 0 ? Math.max(...items.map(i => (i as any).sort_order || 0)) : 0;

    if ((supabase as any).supabaseUrl?.includes("placeholder")) {
      console.error("❌ Cannot add item: Supabase is not configured.");
      return;
    }

    // Optimistic update
    const newItem = { ...item, created_at: new Date().toISOString(), sort_order: maxSortOrder + 1 } as ShoppingItem;
    set({ items: [...items, newItem] });

    const { error } = await supabase.from("shopping_items").insert([{
      ...item,
      sort_order: maxSortOrder + 1,
      created_at: new Date().toISOString(),
    }]);

    if (error) {
      console.error("❌ Supabase Error adding item:", error);
      // Rollback
      set({ items: items });
      throw error;
    }
  },

  toggleItem: async (id, checked) => {
    const { items } = get();
    // Optimistic update
    set({
      items: items.map((item) =>
        item.id === id ? { ...item, checked: !checked } : item
      ),
    });

    const { error } = await supabase
      .from("shopping_items")
      .update({ checked: !checked })
      .eq("id", id);

    if (error) {
      console.error("Error toggling item:", error);
      // Rollback
      set({ items });
    }
  },

  removeItem: async (id) => {
    const { items } = get();
    // Optimistic update
    set({ items: items.filter((item) => item.id !== id) });

    const { error } = await supabase
      .from("shopping_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing item:", error);
      // Rollback
      set({ items });
    }
  },

  updateItemPrice: async (id, price, isEstimated) => {
    const { items } = get();
    // Optimistic update
    set({
      items: items.map((item) =>
        item.id === id ? { ...item, estimated_price: price, price_is_estimated: isEstimated } : item
      ),
    });

    const { error } = await supabase
      .from("shopping_items")
      .update({
        estimated_price: price,
        price_is_estimated: isEstimated,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating price:", error);
      // Rollback
      set({ items });
    }
  },

  editItem: async (id, updates) => {
    const { items } = get();
    // Optimistic update
    set({
      items: items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });

    const { error } = await supabase
      .from("shopping_items")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error editing item:", error);
      // Rollback
      set({ items });
    }
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

  saveCurrentList: async (name, category) => {
    const { items } = get();
    const categoryItems = items.filter(i => i.category === category);
    
    if (categoryItems.length === 0) return;
    
    set({ isLoading: true });
    
    try {
      // 1. Create the saved list entry
      const { data: listData, error: listError } = await supabase
        .from("saved_lists")
        .insert([{ name, category }])
        .select()
        .single();
        
      if (listError) throw listError;
      
      // 2. Insert items into saved_list_items
      const itemsToSave = categoryItems.map(item => ({
        list_id: listData.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.estimated_price
      }));
      
      const { error: itemsError } = await supabase
        .from("saved_list_items")
        .insert(itemsToSave);
        
      if (itemsError) throw itemsError;
      
      // 3. Remove from active list
      const idsToRemove = categoryItems.map(i => i.id);
      const { error: removeError } = await supabase
        .from("shopping_items")
        .delete()
        .in("id", idsToRemove);
        
      if (removeError) throw removeError;
      
      // 4. Update state
      set({ 
        items: items.filter(i => !idsToRemove.includes(i.id)),
        isLoading: false 
      });
      
      // Refresh saved lists
      get().fetchSavedLists();
      
    } catch (error) {
      console.error("Error saving list:", error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  fetchSavedLists: async () => {
    const { data, error } = await supabase
      .from("saved_lists")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      set({ savedLists: data as SavedList[] });
    }
  },
  
  fetchSavedListItems: async (listId) => {
    const { data, error } = await supabase
      .from("saved_list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("Error fetching list items:", error);
      return [];
    }
    
    return data as SavedListItem[];
  },
  
  reuseItem: async (item, category) => {
    const newItem: Omit<ShoppingItem, "created_at"> = {
      id: crypto.randomUUID(),
      name: item.name!,
      quantity: item.quantity || "1",
      unit: item.unit || "un",
      category: category,
      estimated_price: item.price,
      price_is_estimated: false,
      checked: false,
      added_by: "Manoel" as const, // Default
    };
    
    await get().addItem(newItem);
  },
  
  deleteSavedList: async (listId) => {
    const { error } = await supabase
      .from("saved_lists")
      .delete()
      .eq("id", listId);
      
    if (!error) {
      set({ savedLists: get().savedLists.filter(l => l.id !== listId) });
    } else {
      console.error("Error deleting list:", error);
    }
  },
}));
