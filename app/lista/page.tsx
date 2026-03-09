"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ShoppingBag, Pill, Bone, Trash2, Loader2, GripVertical, ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useShoppingStore,
  Category,
  ShoppingItem,
} from "@/hooks/useShoppingList";
import { cn } from "@/lib/utils";
import { Nucha } from "@/components/characters/Nucha";
import { Manoel } from "@/components/characters/Manoel";
import { Jimmy } from "@/components/characters/Jimmy";

const CATEGORIES: {
  id: Category;
  label: string;
  icon: any;
  color: string;
  bg: string;
}[] = [
  {
    id: "mercado",
    label: "Mercado",
    icon: ShoppingBag,
    color: "text-[var(--accent-green)]",
    bg: "bg-[var(--accent-green)]",
  },
  {
    id: "farmacia",
    label: "Farmácia",
    icon: Pill,
    color: "text-[var(--accent-purple)]",
    bg: "bg-[var(--accent-purple)]",
  },
  {
    id: "pets",
    label: "Pets",
    icon: Bone,
    color: "text-[var(--accent-pet)]",
    bg: "bg-[var(--accent-pet)]",
  },
];

export default function ListaPage() {
  const [activeTab, setActiveTab] = useState<Category>("mercado");
  const [isAdding, setIsAdding] = useState(false);

  const { items, toggleItem, removeItem, reorderItems } = useShoppingStore();

  const filteredItems = items.filter((i) => i.category === activeTab);

  const total = filteredItems.reduce(
    (acc, item) => acc + (item.estimated_price || 0),
    0,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderItems(active.id as string, over.id as string);
    }
  };

  return (
    <main className="min-h-screen safe-pt relative pb-32">
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-40 glass">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Lista de Compras
          </h1>
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex px-4 gap-2 mb-6 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 rounded-2xl transition-colors whitespace-nowrap",
                isActive
                  ? "text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className={cn("absolute inset-0 rounded-2xl -z-10", cat.bg)}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <cat.icon className="w-5 h-5" />
              <span className="font-semibold">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              {activeTab === "mercado" && (
                <Nucha className="w-32 h-32 mb-4" state="idle" />
              )}
              {activeTab === "farmacia" && (
                <Manoel className="w-32 h-32 mb-4" state="idle" />
              )}
              {activeTab === "pets" && (
                <Jimmy className="w-32 h-32 mb-4" state="idle" />
              )}
              <p className="text-[var(--text-muted)] font-medium">
                Nada na lista ainda!
                <br />
                Vamos às compras? 🛒
              </p>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <motion.ul className="space-y-3">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </motion.ul>
              </SortableContext>
            </DndContext>
          )}
        </AnimatePresence>
      </div>

      {/* Total */}
      {filteredItems.length > 0 && (
        <div className="px-6 py-4 mt-6 border-t border-[var(--border)] flex justify-between items-center">
          <span className="text-[var(--text-secondary)] font-medium">
            Total Estimado
          </span>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            R$ {total.toFixed(2)}
          </span>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--accent-primary)] text-white shadow-lg flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Item Sheet */}
      <AnimatePresence>
        {isAdding && (
          <AddItemSheet
            onClose={() => setIsAdding(false)}
            defaultCategory={activeTab}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ItemCard({
  item,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "bg-[var(--bg-card)] p-4 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 transition-all relative",
        item.checked && "opacity-60",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <button
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(50);
          onToggle();
        }}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
          item.checked
            ? "bg-[var(--accent-green)] border-[var(--accent-green)]"
            : "border-[var(--text-muted)]",
        )}
      >
        {item.checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-white"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-semibold text-[var(--text-primary)] truncate transition-all",
            item.checked && "line-through text-[var(--text-muted)]",
          )}
        >
          {item.name}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {item.quantity} {item.unit}
        </p>
      </div>

      <div className="text-right shrink-0">
        {item.estimated_price === undefined ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] mx-auto" />
        ) : (
          <p className="font-semibold text-[var(--text-primary)]">
            R$ {item.estimated_price.toFixed(2)}
          </p>
        )}
        {item.price_is_estimated && (
          <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
            IA
          </span>
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-2 text-red-400 hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.li>
  );
}

function AddItemSheet({
  onClose,
  defaultCategory,
}: {
  onClose: () => void;
  defaultCategory: Category;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [price, setPrice] = useState("");
  const [addedBy, setAddedBy] = useState<"Manoel" | "Nucha">("Manoel");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addItem, updateItemPrice } = useShoppingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const newItemId = crypto.randomUUID();
    const parsedPrice = price ? parseFloat(price.replace(",", ".")) : undefined;

    addItem({
      id: newItemId,
      name,
      quantity,
      unit,
      category,
      estimated_price: parsedPrice,
      price_is_estimated: false,
      checked: false,
      added_by: addedBy,
    });

    onClose();

    // If no price, fetch from API
    if (!price) {
      try {
        const res = await fetch("/api/price-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: name, category }),
        });
        const data = await res.json();
        if (data.price) {
          updateItemPrice(newItemId, data.price, data.source === "ai_estimate");
        } else {
          updateItemPrice(newItemId, 0, false);
        }
      } catch (error) {
        console.error("Failed to fetch price", error);
        updateItemPrice(newItemId, 0, false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[var(--bg-card)] rounded-t-3xl p-6 pb-safe shadow-2xl relative z-10"
      >
        <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
          Adicionar Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Produto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Ex: Arroz, Ração, Dipirona"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Qtd
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="un">un</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="cx">cx</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Categoria
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-medium transition-colors",
                    category === cat.id
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                      : "bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)]",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Preço (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="Deixe vazio para estimar por IA"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--accent-primary)] text-white font-bold py-4 rounded-xl mt-4 hover:bg-opacity-90 transition-colors flex justify-center items-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Adicionar à Lista"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
