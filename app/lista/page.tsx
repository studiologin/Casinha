"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ShoppingBag, Pill, Bone, Trash2, Loader2, GripVertical, ChevronLeft, Utensils, CheckCircle2, History, Save, Archive, ChevronDown, ChevronUp, RefreshCw, Camera } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    {
      id: "menu",
      label: "Menu",
      icon: Utensils,
      color: "text-[var(--accent-primary)]",
      bg: "bg-[var(--accent-primary)]",
    },
    {
      id: "historico",
      label: "Histórico",
      icon: History,
      color: "text-[var(--accent-blue)]",
      bg: "bg-[var(--accent-blue)]",
    },
  ];

function ListaContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Category;
  
  const [activeTab, setActiveTab] = useState<Category>("mercado");
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [listToDelete, setListToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStoreLoading, setIsStoreLoading] = useState(false);

  const { items, savedLists, fetchItems, fetchSavedLists, toggleItem, removeItem, reorderItems, saveCurrentList, reuseItem, deleteSavedList, fetchSavedListItems } = useShoppingStore();

  useEffect(() => {
    fetchItems();
    fetchSavedLists();
  }, [fetchItems, fetchSavedLists]);

  useEffect(() => {
    if (tabParam && CATEGORIES.some(c => c.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      // Se não houver parâmetro (clique no ícone Lista), volta para Mercado
      setActiveTab("mercado");
    }
  }, [tabParam]);

  const filteredItems = items.filter((i) => i.category === activeTab);

  const total = filteredItems.reduce(
    (acc, item) => acc + (item.estimated_price || 0) * (parseFloat(item.quantity) || 1),
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

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    await removeItem(itemToDelete.id);

    // Sucesso rápido: 0.8s
    setTimeout(() => {
      setItemToDelete(null);
      setIsDeleting(false);
    }, 800);
  };

  const confirmDeleteList = async () => {
    if (!listToDelete) return;

    setIsDeleting(true);
    await deleteSavedList(listToDelete.id);

    // Sucesso rápido: 0.8s
    setTimeout(() => {
      setListToDelete(null);
      setIsDeleting(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative content-bottom-padding">
      <header className="px-6 py-4 flex justify-between items-center z-40 glass shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Lista de Compras
          </h1>
        </Link>
        <button
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Adicionar item"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto w-full pb-6">
        {/* Tabs - Improved Responsiveness */}
        <div className="flex px-4 gap-2 mb-4 mt-4 overflow-x-auto no-scrollbar shrink-0 scroll-smooth">
          <div className="flex gap-2 pb-1 sm:justify-center w-full">
            {CATEGORIES.filter(c => c.id !== "historico").map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
                    isActive
                      ? "text-white shadow-md scale-105"
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
                  <cat.icon className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="px-4">
          <AnimatePresence mode="popLayout">
            {activeTab === "historico" ? (
              <HistoryView 
                lists={savedLists} 
                onDelete={(list) => setListToDelete(list)} 
                fetchItems={fetchSavedListItems}
                onReuse={(item) => {
                  reuseItem(item, "mercado"); // Default to mercado for now, can be improved
                  setActiveTab("mercado");
                }}
              />
            ) : filteredItems.length === 0 ? (
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
                        onToggle={() => toggleItem(item.id, item.checked)}
                        onRemove={() => setItemToDelete(item)}
                        onEdit={() => setEditingItem(item)}
                      />
                    ))}
                  </motion.ul>
                </SortableContext>
              </DndContext>
            )}
          </AnimatePresence>
        </div>
        {isStoreLoading && items.length === 0 && (
          <div className="flex justify-center py-10 text-[var(--text-muted)]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
      </div>

      {/* Total - Fixed at bottom of current view */}
      {activeTab !== "historico" && filteredItems.length > 0 && (
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-primary)] flex flex-col gap-4 shrink-0 z-10">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)] font-medium">
              Total Estimado
            </span>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setIsSaving(true)}
            className="w-full h-12 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-sm"
          >
            <Archive className="w-5 h-5" />
            Salvar e Limpar Lista
          </button>

          <div className="flex justify-center">
            <span className="text-[10px] text-[var(--text-muted)]">v1.0.3</span>
          </div>
        </div>
      )}


      {/* Add Item Sheet */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <AddItemSheet
            onClose={() => {
              setIsAdding(false);
              setEditingItem(null);
            }}
            defaultCategory={activeTab === "historico" ? "mercado" : activeTab}
            itemToEdit={editingItem || undefined}
          />
        )}
      </AnimatePresence>

      {/* Save List Modal */}
      <AnimatePresence>
        {isSaving && (
          <SaveListModal
            category={activeTab === "historico" ? "mercado" : activeTab}
            onClose={() => setIsSaving(false)}
            onSaved={() => {
              setIsSaving(false);
              // Store already clears the items and fetches history
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-card)] max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-[var(--border)] text-center"
            >
              {!isDeleting ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Excluir item?
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Tem certeza que deseja remover "<strong>{itemToDelete.name}</strong>" da lista?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setItemToDelete(null)}
                      className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDeleteItem}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--accent-green)]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Item excluído!
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-4">
                    Atualizando a lista em 3 segundos...
                  </p>
                  <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent-green)]"
                      initial={{ width: "100%" }}
                      animate={{ width: 0 }}
                      transition={{ duration: 0.8, ease: "linear" }}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete List Confirmation Modal */}
      <AnimatePresence>
        {listToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-card)] max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-[var(--border)] text-center"
            >
              {!isDeleting ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Excluir histórico?
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-6 text-sm">
                    Tem certeza que deseja remover a lista "<strong>{listToDelete.name}</strong>" permanentemente?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setListToDelete(null)}
                      className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDeleteList}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--accent-green)]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Histórico removido!
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-4 text-sm">
                    Limpando os dados...
                  </p>
                  <div className="w-full h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--accent-green)]"
                      initial={{ width: "100%" }}
                      animate={{ width: 0 }}
                      transition={{ duration: 0.8, ease: "linear" }}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemCard({
  item,
  onToggle,
  onRemove,
  onEdit,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: () => void;
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

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onEdit}
      >
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
            R$ {(item.estimated_price * (parseFloat(item.quantity) || 1)).toFixed(2)}
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
  itemToEdit,
}: {
  onClose: () => void;
  defaultCategory: Category;
  itemToEdit?: ShoppingItem;
}) {
  const [name, setName] = useState(itemToEdit?.name || "");
  const [quantity, setQuantity] = useState(itemToEdit?.quantity || "1");
  const [unit, setUnit] = useState(itemToEdit?.unit || "un");
  const [category, setCategory] = useState<Exclude<Category, "historico">>(
    itemToEdit?.category || (defaultCategory === "historico" ? "mercado" : defaultCategory as Exclude<Category, "historico">),
  );
  const [price, setPrice] = useState(
    itemToEdit?.estimated_price?.toString() || "",
  );
  const [addedBy, setAddedBy] = useState<"Manoel" | "Nucha">(
    itemToEdit?.added_by || "Manoel",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addItem, updateItemPrice, editItem } = useShoppingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const parsedPrice = price ? parseFloat(price.replace(",", ".")) : undefined;
    const finalPrice = parsedPrice; // Salvamos o preço UNITÁRIO agora!

    if (itemToEdit) {
      await editItem(itemToEdit.id, {
        name,
        quantity,
        unit,
        category,
        estimated_price: finalPrice,
        price_is_estimated: false,
      });

      // Re-fetch price if name changed and price is empty
      if (!price && name !== itemToEdit.name) {
        await fetchPrice(itemToEdit.id);
      }
    } else {
      const newItemId = crypto.randomUUID();
      await addItem({
        id: newItemId,
        name,
        quantity,
        unit,
        category,
        estimated_price: finalPrice,
        price_is_estimated: false,
        checked: false,
        added_by: addedBy,
      });

      if (!price) {
        await fetchPrice(newItemId);
      }
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    // Fecha em 0.8s para ser bem ágil
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const fetchPrice = async (itemId: string) => {
    try {
      const res = await fetch("/api/price-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: name, category }),
      });
      const data = await res.json();
      if (data.price) {
        updateItemPrice(itemId, data.price, data.source === "ai_estimate");
      } else {
        updateItemPrice(itemId, 0, false);
      }
    } catch (error) {
      console.error("Failed to fetch price", error);
      updateItemPrice(itemId, 0, false);
    }
  };
  const handleScan = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // 1. Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) return;

        // 2. Send to API
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();

        if (data.name) {
          setName(data.name);
        }
        if (data.price !== undefined && data.price > 0) {
          setPrice(data.price.toString());
        }
        if (data.unit) {
          setUnit(data.unit);
        }

        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error("Error analyzing product:", error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
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
        className="w-full max-w-md bg-[var(--bg-card)] rounded-t-3xl p-6 pb-16 shadow-2xl relative z-10"
      >
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[var(--border)]/50 rounded-full sm:hidden" />
        <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
          {itemToEdit ? "Editar Item" : "Adicionar Item"}
        </h2>

        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleScan}
            disabled={isAnalyzing}
            className={cn(
              "w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 transition-all",
              isAnalyzing ? "bg-[var(--bg-secondary)]" : "bg-[var(--bg-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card)]"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Identificando produto...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-[var(--text-primary)]">Escanear Produto</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">Tire uma foto para identificar nome e preço</span>
                </div>
              </>
            )}
          </button>
        </div>

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
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c.id !== "historico").map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as Exclude<Category, "historico">)}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl border text-sm font-medium transition-colors",
                    category === cat.id
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm"
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
            ) : itemToEdit ? (
              "Salvar Alterações"
            ) : (
              "Adicionar à Lista"
            )}
          </button>
        </form>

        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[110] bg-[var(--bg-card)] rounded-3xl p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-[var(--accent-green)]/20 rounded-full flex items-center justify-center mb-6 text-[var(--accent-green)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Sucesso! 🎉
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Item {itemToEdit ? "atualizado" : "adicionado"} com sucesso!
                <br />
                Multiplicamos o valor pela quantidade.
              </p>
              <div className="w-full max-w-[200px] space-y-2">
                <p className="text-xs text-[var(--text-muted)]">Atualizando a lista...</p>
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent-green)]"
                    initial={{ width: "100%" }}
                    animate={{ width: 0 }}
                    transition={{ duration: 0.8, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div >
  );
}

function SaveListModal({
  category,
  onClose,
  onSaved,
}: {
  category: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveCurrentList } = useShoppingStore();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await saveCurrentList(name, category);
      onSaved();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg-card)] max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-[var(--border)]"
      >
        <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--accent-primary)]">
          <Archive className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
          Salvar Lista de Compras
        </h2>
        <p className="text-[var(--text-secondary)] text-center mb-6 text-sm">
          A lista atual será movida para o histórico e limpa da tela.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <input
            autoFocus
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="Ex: Rancho do Mês, Churrasco..."
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-bold flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function HistoryView({
  lists,
  onDelete,
  onReuse,
  fetchItems
}: {
  lists: any[];
  onDelete: (list: any) => void;
  onReuse: (item: any) => void;
  fetchItems: (id: string) => Promise<any[]>;
}) {
  return (
    <div className="space-y-4 py-2">
      {lists.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-muted)]">
          <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Nenhuma lista salva ainda.</p>
        </div>
      ) : (
        lists.map((list) => (
          <HistoryCard 
            key={list.id} 
            list={list} 
            onDelete={() => onDelete(list)} 
            onReuse={onReuse}
            fetchItems={() => fetchItems(list.id)}
          />
        ))
      )}
    </div>
  );
}

function HistoryCard({ 
  list, 
  onDelete, 
  onReuse,
  fetchItems 
}: { 
  list: any; 
  onDelete: () => void;
  onReuse: (item: any) => void;
  fetchItems: () => Promise<any[]>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleExpand = async () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && items.length === 0) {
      setIsLoading(true);
      const data = await fetchItems();
      setItems(data);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)]/30 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            list.category === "mercado" ? "bg-[var(--accent-green)]" :
            list.category === "farmacia" ? "bg-[var(--accent-purple)]" :
            list.category === "pets" ? "bg-[var(--accent-pet)]" : "bg-[var(--accent-primary)]"
          )}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">{list.name}</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {new Date(list.created_at).toLocaleDateString('pt-BR')} • {list.category.charAt(0).toUpperCase() + list.category.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border)] bg-[var(--bg-primary)]/30"
          >
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {items.length === 0 ? (
                  <li className="p-4 text-center text-xs text-[var(--text-muted)] italic">Nenhum item nesta lista.</li>
                ) : (
                  items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {item.quantity} {item.unit} • R$ {((item.price || 0) * (parseFloat(item.quantity) || 1)).toFixed(2)}
                        </p>
                      </div>
                      <button 
                        onClick={() => onReuse(item)}
                        className="bg-[var(--accent-primary)] text-white p-2 rounded-lg scale-0 group-hover:scale-100 transition-transform active:scale-90"
                        title="Reutilizar item"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListaPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-primary)]" />
      </div>
    }>
      <ListaContent />
    </Suspense>
  );
}
