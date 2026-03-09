"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CharacterProps {
  className?: string;
  state?: "idle" | "happy" | "action";
}

export function Manoel({ className, state = "idle" }: CharacterProps) {
  return (
    <motion.div
      className={cn("relative w-24 h-24", className)}
      animate={
        state === "idle"
          ? { y: [0, -4, 0] }
          : state === "happy"
            ? { y: [0, -10, 0], scale: [1, 1.05, 1] }
            : { rotate: [0, -5, 5, 0] }
      }
      transition={{
        duration: state === "idle" ? 3 : 0.5,
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
          d="M30 100V60C30 48.9543 38.9543 40 50 40C61.0457 40 70 48.9543 70 60V100H30Z"
          fill="#5B8FD4"
        />
        {/* Head */}
        <circle cx="50" cy="35" r="20" fill="#FFD1B3" />
        {/* Hair */}
        <path
          d="M28 35C28 20 38 10 50 10C62 10 72 20 72 35C72 35 65 25 50 25C35 25 28 35 28 35Z"
          fill="#2C2416"
        />
        {/* Eyes */}
        <circle cx="43" cy="33" r="2" fill="#2C2416" />
        <circle cx="57" cy="33" r="2" fill="#2C2416" />
        {/* Smile */}
        <path
          d="M45 42C45 42 48 45 50 45C52 45 55 42 55 42"
          stroke="#2C2416"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Arm waving if action */}
        {state === "action" && (
          <motion.path
            d="M70 60Q85 50 90 30"
            stroke="#5B8FD4"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [0, 20, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: "70px 60px" }}
          />
        )}
      </svg>
    </motion.div>
  );
}
