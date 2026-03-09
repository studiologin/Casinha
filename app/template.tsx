"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { Manoel } from "@/components/characters/Manoel";
import { Nucha } from "@/components/characters/Nucha";
import { Johnny } from "@/components/characters/Johnny";
import { Jack } from "@/components/characters/Jack";
import { Jimmy } from "@/components/characters/Jimmy";
import { useState, useEffect } from "react";

/**
 * Template component in Next.js re-mounts on every navigation,
 * making it perfect for page transitions.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showTransition, setShowTransition] = useState(true);

    useEffect(() => {
        // Show transition overlay on every path change
        setShowTransition(true);
        const timer = setTimeout(() => setShowTransition(false), 1400); // Wait for characters to pass
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            <AnimatePresence>
                {showTransition && (
                    <motion.div
                        key="page-transition-overlay"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden pointer-events-none"
                    >
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                            {/* Character Parade */}
                            <motion.div
                                initial={{ x: "-120%" }}
                                animate={{ x: "120%" }}
                                transition={{
                                    duration: 1.6,
                                    ease: "easeInOut"
                                }}
                                className="flex items-end gap-3 mb-4"
                            >
                                <Manoel state="happy" className="w-24 h-24" />
                                <div className="flex gap-2 mb-2 items-end">
                                    <Johnny className="w-14 h-14" />
                                    <Jack className="w-14 h-14" />
                                    <Jimmy className="w-14 h-14" />
                                </div>
                                <Nucha state="happy" className="w-24 h-24" />
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                                transition={{ duration: 1.6, times: [0, 0.2, 0.8, 1] }}
                                className="text-xl font-bold text-[var(--accent-primary)] italic"
                            >
                                Arrumando a Casinha...
                            </motion.p>

                            {/* Decorative dots */}
                            <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--border)] opacity-20 -z-10" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="flex-1 flex flex-col overflow-hidden w-full h-full"
            >
                {children}
            </motion.div>
        </>
    );
}
