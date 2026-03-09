"use client";

import { Home, ShoppingCart, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Lista", href: "/lista", icon: ShoppingCart },
    { name: "Menu", href: "/menu", icon: Utensils },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass safe-pb">
      <nav className="flex items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-12"
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
