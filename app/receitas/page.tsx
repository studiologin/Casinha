"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    BookOpen,
    Search,
    ChevronRight,
    Clock,
    ChefHat,
    Trash2,
    ChevronLeft,
    CheckCircle2
} from "lucide-react";
import { useRecipesStore, Recipe } from "@/hooks/useRecipes";
import { cn } from "@/lib/utils";
import { Manoel } from "@/components/characters/Manoel";
import { Nucha } from "@/components/characters/Nucha";

export default function RecipesPage() {
    const { recipes, isLoading, fetchRecipes, deleteRecipe } = useRecipesStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const filteredRecipes = recipes.filter(
        (r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedRecipe) {
        return <RecipeDetailView recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative pb-16">
            <header className="px-6 py-4 flex justify-between items-center z-40 glass shrink-0">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Receitas
                </h1>
                <div className="w-10 h-10 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center text-[var(--accent-primary)]">
                    <BookOpen className="w-5 h-5" />
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-6 py-4 shrink-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Buscar receitas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <ChefHat className="w-12 h-12 text-[var(--accent-primary)] animate-bounce" />
                        <p className="text-[var(--text-muted)] animate-pulse">Carregando receitas...</p>
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                        <div className="flex gap-2">
                            <Manoel className="w-20 h-20" state="happy" />
                            <Nucha className="w-20 h-20" state="happy" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                            {searchTerm ? "Nenhuma receita encontrada" : "Nenhuma receita salva ainda"}
                        </h3>
                        <p className="text-[var(--text-secondary)]">
                            {searchTerm
                                ? "Tente buscar com outros termos."
                                : "Vá ao Menu Especial e sugira algo delicioso para começar sua coleção!"}
                        </p>
                    </div>
                ) : (
                    filteredRecipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative group overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] pr-8">
                                    {recipe.name}
                                </h3>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Deseja excluir esta receita?")) {
                                            deleteRecipe(recipe.id);
                                        }
                                    }}
                                    className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 pr-4">
                                {recipe.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {recipe.prep_time}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ChefHat className="w-3.5 h-3.5" />
                                    {recipe.difficulty}
                                </div>
                            </div>
                            <div className="absolute right-4 bottom-5 text-[var(--accent-primary)]">
                                <ChevronRight className="w-6 h-6" />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

function RecipeDetailView({
    recipe,
    onBack,
}: {
    recipe: Recipe;
    onBack: () => void;
}) {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const toggleStep = (index: number) => {
        if (completedSteps.includes(index)) {
            setCompletedSteps(completedSteps.filter((i) => i !== index));
        } else {
            setCompletedSteps([...completedSteps, index]);
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative pb-16">
            <header className="px-6 py-4 z-40 glass border-b border-[var(--border)] shrink-0 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)]"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
                        {recipe.name}
                    </h1>
                    <div className="h-1 bg-[var(--bg-secondary)] rounded-full mt-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-[var(--accent-green)]"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${(completedSteps.length / recipe.steps.length) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                {/* Intro */}
                <div>
                    <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                        {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8 text-xs sm:text-sm font-medium">
                        <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1.5 rounded-full">
                            ⏱️ {recipe.prep_time}
                        </span>
                        <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1.5 rounded-full">
                            👨‍🍳 {recipe.difficulty}
                        </span>
                        <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1.5 rounded-full">
                            🍽️ {recipe.servings} porções
                        </span>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full" />
                        Ingredientes
                    </h3>
                    <ul className="space-y-3">
                        {recipe.ingredients.map((ing, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center text-[var(--text-secondary)] py-2 border-b border-[var(--border)] last:border-0"
                            >
                                <span>{ing.item}</span>
                                <span className="font-bold text-[var(--text-primary)]">
                                    {ing.quantity}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[var(--accent-primary)] rounded-full" />
                        Passo a Passo
                    </h3>
                    {recipe.steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(index);
                        return (
                            <motion.div
                                key={index}
                                layout
                                className={cn(
                                    "bg-[var(--bg-card)] p-5 rounded-2xl border transition-all cursor-pointer",
                                    isCompleted
                                        ? "border-[var(--accent-green)] opacity-70"
                                        : "border-[var(--border)] shadow-sm",
                                )}
                                onClick={() => toggleStep(index)}
                            >
                                <div className="flex gap-4">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                                            isCompleted
                                                ? "bg-[var(--accent-green)] border-[var(--accent-green)] text-white"
                                                : "border-[var(--text-muted)] text-[var(--text-muted)] font-bold",
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <p
                                        className={cn(
                                            "text-[var(--text-primary)] font-medium transition-all flex-1",
                                            isCompleted && "line-through text-[var(--text-muted)]",
                                        )}
                                    >
                                        {step.text}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {completedSteps.length === recipe.steps.length && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="fixed bottom-24 left-6 right-6 bg-[var(--accent-green)] text-white p-6 rounded-3xl shadow-2xl text-center z-50 border-4 border-white/20"
                    >
                        <h2 className="text-2xl font-bold mb-4">Parabéns! Prato finalizado! 🥘✨</h2>
                        <button
                            onClick={onBack}
                            className="bg-white text-[var(--accent-green)] font-extrabold py-3.5 px-8 rounded-full w-full shadow-lg"
                        >
                            Voltar para a Lista
                        </button>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
