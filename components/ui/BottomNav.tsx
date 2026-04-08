"use client";

import { Home, ShoppingCart, Utensils, BookOpen, History } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabInUrl = searchParams.get("tab");

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Lista", href: "/lista", icon: ShoppingCart },
    { name: "Histórico", href: "/lista?tab=historico", icon: History },
    { name: "Menu", href: "/menu", icon: Utensils },
    { name: "Receitas", href: "/receitas", icon: BookOpen },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass safe-pb pb-[calc(var(--safe-bottom)+4px)]">
      <nav className="flex items-center justify-around px-6 py-3 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
        {navItems.map((item) => {
          // Special logic for Lista and Historico
          let isActive = false;
          if (item.name === "Histórico") {
            isActive = pathname === "/lista" && activeTabInUrl === "historico";
          } else if (item.name === "Lista") {
            isActive = pathname === "/lista" && (activeTabInUrl === null || activeTabInUrl !== "historico");
          } else {
            isActive = pathname === item.href;
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center min-w-[64px] h-12 shrink-0 px-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-[var(--accent-primary)]/10 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "w-6 h-6 mb-1 transition-colors z-10",
                  isActive
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium z-10 transition-colors",
                  isActive
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
