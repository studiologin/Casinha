"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CharacterProps {
  className?: string;
  state?: "idle" | "happy" | "action";
}

export function Johnny({ className, state = "idle" }: CharacterProps) {
  // Spitz Alemão Anão — Branco Acinzentado
  return (
    <motion.div
      className={cn("relative w-16 h-16", className)}
      animate={
        state === "idle"
          ? { y: [0, -2, 0] }
          : state === "happy"
            ? { y: [0, -8, 0] }
            : { rotate: [0, -10, 10, 0] }
      }
      transition={{
        duration: state === "idle" ? 2 : 0.3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Tail */}
        <motion.path
          d="M80 70C90 60 95 40 80 30C70 20 60 40 70 50"
          fill="#E5E7EB"
          animate={
            state === "happy"
              ? { rotate: [0, 15, -15, 0] }
              : { rotate: [0, 5, -5, 0] }
          }
          transition={{
            duration: state === "happy" ? 0.2 : 1,
            repeat: Infinity,
          }}
          style={{ transformOrigin: "70px 60px" }}
        />
        {/* Body Fluff */}
        <circle cx="50" cy="60" r="25" fill="#F3F4F6" />
        <circle cx="40" cy="65" r="20" fill="#E5E7EB" />
        <circle cx="60" cy="65" r="20" fill="#E5E7EB" />
        {/* Head */}
        <circle cx="45" cy="45" r="18" fill="#F3F4F6" />
        {/* Ears */}
        <path d="M35 35L30 15L45 28Z" fill="#E5E7EB" />
        <path d="M55 35L60 15L45 28Z" fill="#E5E7EB" />
        {/* Eyes */}
        <circle cx="40" cy="42" r="2" fill="#2C2416" />
        <circle cx="50" cy="42" r="2" fill="#2C2416" />
        {/* Nose */}
        <circle cx="45" cy="48" r="2.5" fill="#2C2416" />
        {/* Mouth */}
        <path
          d="M42 52Q45 55 48 52"
          stroke="#2C2416"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
