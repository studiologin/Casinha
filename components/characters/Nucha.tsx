"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CharacterProps {
  className?: string;
  state?: "idle" | "happy" | "action";
}

export function Nucha({ className, state = "idle" }: CharacterProps) {
  return (
    <motion.div
      className={cn("relative w-24 h-24", className)}
      animate={
        state === "idle"
          ? { y: [0, -4, 0] }
          : state === "happy"
            ? { y: [0, -10, 0], scale: [1, 1.05, 1] }
            : { rotate: [0, 5, -5, 0] }
      }
      transition={{
        duration: state === "idle" ? 3.2 : 0.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Body */}
        <path
          d="M25 100V65C25 51.1929 36.1929 40 50 40C63.8071 40 75 51.1929 75 65V100H25Z"
          fill="#E8763A"
        />
        {/* Hair Back */}
        <path
          d="M25 40C25 20 35 10 50 10C65 10 75 20 75 40C75 60 70 70 50 70C30 70 25 60 25 40Z"
          fill="#4A3424"
        />
        {/* Head */}
        <circle cx="50" cy="35" r="18" fill="#FFD1B3" />
        {/* Hair Front */}
        <path
          d="M32 35C32 20 40 10 50 10C60 10 68 20 68 35C68 35 60 20 50 20C40 20 32 35 32 35Z"
          fill="#4A3424"
        />
        {/* Eyes */}
        <circle cx="44" cy="33" r="2" fill="#2C2416" />
        <circle cx="56" cy="33" r="2" fill="#2C2416" />
        {/* Smile */}
        <path
          d="M46 41C46 41 48 44 50 44C52 44 54 41 54 41"
          stroke="#2C2416"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Arm waving if action */}
        {state === "action" && (
          <motion.path
            d="M25 65Q10 55 15 35"
            stroke="#E8763A"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [0, -20, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: "25px 65px" }}
          />
        )}
      </svg>
    </motion.div>
  );
}
