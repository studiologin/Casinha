import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface RecipeIngredient {
    item: string;
    quantity: string;
}

export interface RecipeStep {
    text: string;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    servings: number;
    prep_time: string;
    difficulty: string;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    image_prompt?: string;
    image_url?: string;
    created_at: string;
}

interface RecipesState {
    recipes: Recipe[];
    isLoading: boolean;
    fetchRecipes: () => Promise<void>;
    saveRecipe: (recipe: Omit<Recipe, "id" | "created_at">) => Promise<void>;
    deleteRecipe: (id: string) => Promise<void>;
}

export const useRecipesStore = create<RecipesState>((set, get) => ({
    recipes: [],
    isLoading: false,

    fetchRecipes: async () => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from("recipes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            set({ recipes: (data as Recipe[]) || [], isLoading: false });
        } catch (error) {
            console.error("❌ Error fetching recipes:", error);
            set({ isLoading: false });
        }
    },

    saveRecipe: async (recipe) => {
        try {
            const { data, error } = await supabase
                .from("recipes")
                .insert([recipe])
                .select()
                .single();

            if (error) throw error;

            const { recipes } = get();
            set({ recipes: [data as Recipe, ...recipes] });
        } catch (error) {
            console.error("❌ Error saving recipe:", error);
            throw error;
        }
    },

    deleteRecipe: async (id) => {
        // Optimistic update
        const { recipes } = get();
        set({ recipes: recipes.filter((r) => r.id !== id) });

        try {
            const { error } = await supabase
                .from("recipes")
                .delete()
                .eq("id", id);

            if (error) throw error;
        } catch (error) {
            console.error("❌ Error deleting recipe:", error);
            // Rollback
            set({ recipes });
            throw error;
        }
    },
}));
