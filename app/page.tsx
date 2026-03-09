"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Manoel } from "@/components/characters/Manoel";
import { Nucha } from "@/components/characters/Nucha";
import { Johnny } from "@/components/characters/Johnny";
import { Jack } from "@/components/characters/Jack";
import { Jimmy } from "@/components/characters/Jimmy";
import { Settings, ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]"
            onClick={() => setShowSplash(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-5xl font-extrabold text-[var(--accent-primary)] mb-8 tracking-tight">
                Casinha
              </h1>
              <div className="flex items-end justify-center gap-2">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Manoel state="happy" />
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Johnny state="happy" />
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Jack state="happy" />
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Jimmy state="happy" />
                </motion.div>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <Nucha state="happy" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto w-full p-6 safe-pt">

        <section className="relative h-48 mt-10 mb-10 flex items-end justify-center">
          <div className="absolute inset-0 bg-[var(--bg-secondary)] rounded-3xl -z-10 overflow-hidden">
            {/* Background decoration */}
            <div
              className="absolute top-0 left-0 w-full h-full opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(var(--accent-primary) 2px, transparent 2px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          <div className="flex items-end justify-center gap-1 pb-4">
            <Manoel className="w-20 h-20" />
            <div className="flex gap-1 mb-2">
              <Johnny className="w-12 h-12" />
              <Jack className="w-12 h-12" />
              <Jimmy className="w-12 h-12" />
            </div>
            <Nucha className="w-20 h-20" />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
          <Link href="/lista">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 h-full"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center text-[var(--accent-green)]">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[var(--text-primary)] text-lg">
                  Lista de Compras
                </h2>
                <p className="text-[var(--text-muted)] text-sm">
                  Organize o que falta na casa
                </p>
              </div>
            </motion.div>
          </Link>

          <Link href="/menu">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 h-full"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[var(--text-primary)] text-lg">
                  Menu Especial
                </h2>
                <p className="text-[var(--text-muted)] text-sm">
                  O que vamos comer hoje?
                </p>
              </div>
            </motion.div>
          </Link>
        </section>
      </div>
    </>
  );
}
