"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ChefHat, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Manoel } from "@/components/characters/Manoel";
import { Nucha } from "@/components/characters/Nucha";
import { useShoppingStore, Category } from "@/hooks/useShoppingList";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Recipe {
  recipe_name: string;
  description: string;
  servings: number;
  prep_time: string;
  difficulty: string;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
    category: Category;
    estimated_price: number | null;
  }[];
  steps: { step: number; instruction: string; duration: string }[];
}

export default function MenuPage() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [showRecipeSteps, setShowRecipeSteps] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem } = useShoppingStore();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startChat = async () => {
    setStarted(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/menu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], question_count: 0 }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
      setQuestionCount(1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/menu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          question_count: questionCount,
        }),
      });
      const data = await res.json();

      if (data.is_final && data.recipe) {
        setRecipe(data.recipe);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.message },
        ]);
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRecipe = () => {
    if (!recipe) return;

    // Add ingredients to shopping list
    recipe.ingredients.forEach((ing) => {
      addItem({
        id: crypto.randomUUID(),
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category || "mercado",
        estimated_price: ing.estimated_price || undefined,
        price_is_estimated: false,
        checked: false,
        added_by: "Manoel",
      });
    });

    setShowRecipeSteps(true);
  };

  if (showRecipeSteps && recipe) {
    return <RecipeStepsView recipe={recipe} onBack={() => router.push("/")} />;
  }

  return (
    <main className="min-h-screen safe-pt relative pb-24 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-40 glass">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Menu Especial
          </h1>
        </Link>
      </header>

      {!started ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex justify-center items-end gap-2 mb-8">
            <Manoel className="w-24 h-24" state="happy" />
            <Nucha className="w-24 h-24" state="happy" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Vamos montar um menu especial para vocês! 🍽️
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Responderei algumas perguntas para sugerir a refeição perfeita.
          </p>
          <button
            onClick={startChat}
            className="bg-[var(--accent-primary)] text-white font-bold py-4 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Começar
          </button>
        </div>
      ) : recipe ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-card)] rounded-3xl p-6 shadow-xl border border-[var(--border)]"
          >
            <div className="w-16 h-16 bg-[var(--accent-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--accent-primary)]">
              <ChefHat className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
              {recipe.recipe_name}
            </h2>
            <p className="text-center text-[var(--text-secondary)] mb-6">
              {recipe.description}
            </p>

            <div className="flex justify-center gap-4 mb-6 text-sm font-medium text-[var(--text-muted)]">
              <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                {recipe.prep_time}
              </span>
              <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                {recipe.difficulty}
              </span>
              <span className="bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                {recipe.servings} porções
              </span>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-[var(--text-primary)] mb-3">
                Ingredientes
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-[var(--text-secondary)] text-sm"
                  >
                    <span>{ing.name}</span>
                    <span className="font-medium">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setRecipe(null);
                  setQuestionCount(0);
                  setMessages([]);
                  startChat();
                }}
                className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium"
              >
                Sugerir outra
              </button>
              <button
                onClick={acceptRecipe}
                className="flex-1 py-3 rounded-xl bg-[var(--accent-green)] text-white font-bold shadow-md"
              >
                Gostamos! 🎉
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Progress */}
          <div className="px-6 py-2">
            <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--accent-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${(questionCount / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-center text-[var(--text-muted)] mt-2">
              Pergunta {questionCount} de 5
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] shrink-0 overflow-hidden flex items-end justify-center">
                    {i % 2 === 0 ? (
                      <Manoel className="w-10 h-10" />
                    ) : (
                      <Nucha className="w-10 h-10" />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "p-4 rounded-2xl",
                    msg.role === "user"
                      ? "bg-[var(--accent-primary)] text-white rounded-tr-sm"
                      : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm",
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] shrink-0 overflow-hidden flex items-end justify-center">
                  <Manoel className="w-10 h-10 animate-breathe" />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-tl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border)]">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua resposta..."
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center disabled:opacity-50 shrink-0"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function RecipeStepsView({
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
    <main className="min-h-screen safe-pt bg-[var(--bg-primary)] pb-32">
      <header className="px-6 py-4 sticky top-0 z-40 glass border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
          {recipe.recipe_name}
        </h1>
        <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent-green)]"
            initial={{ width: 0 }}
            animate={{
              width: `${(completedSteps.length / recipe.steps.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <div className="p-6 space-y-4">
        {recipe.steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          return (
            <motion.div
              key={index}
              layout
              className={cn(
                "bg-[var(--bg-card)] p-5 rounded-2xl border transition-all",
                isCompleted
                  ? "border-[var(--accent-green)] opacity-70"
                  : "border-[var(--border)] shadow-[var(--shadow)]",
              )}
              onClick={() => toggleStep(index)}
            >
              <div className="flex gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                    isCompleted
                      ? "bg-[var(--accent-green)] border-[var(--accent-green)] text-white"
                      : "border-[var(--text-muted)] text-[var(--text-muted)]",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="font-bold text-sm">{step.step}</span>
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[var(--text-primary)] font-medium transition-all",
                      isCompleted && "line-through text-[var(--text-muted)]",
                    )}
                  >
                    {step.instruction}
                  </p>
                  <p className="text-xs text-[var(--accent-primary)] font-bold mt-2">
                    ⏱️ {step.duration}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {completedSteps.length === recipe.steps.length && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-6 right-6 bg-[var(--accent-green)] text-white p-6 rounded-3xl shadow-2xl text-center z-50"
        >
          <div className="flex justify-center gap-2 mb-4">
            <Manoel state="happy" className="w-16 h-16" />
            <Nucha state="happy" className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Bom Apetite! 🎉</h2>
          <button
            onClick={onBack}
            className="bg-white text-[var(--accent-green)] font-bold py-3 px-6 rounded-full w-full"
          >
            Voltar para Home
          </button>
        </motion.div>
      )}
    </main>
  );
}
