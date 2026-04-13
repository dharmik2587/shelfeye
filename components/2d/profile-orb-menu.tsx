"use client";

import { motion } from "framer-motion";
import { LogOut, Sparkles, UserCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileOrbMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05, rotateX: 8, rotateY: -8 }}
          className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-zinc-900/80 shadow-volumetric"
          aria-label="Open profile menu"
          type="button"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 via-fuchsia-400/20 to-transparent" />
          <UserCircle2 className="relative mx-auto mt-5 h-6 w-6 text-zinc-100" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-semibold">Alex Rivera</p>
          <p className="text-xs text-zinc-400">Store Intelligence Lead</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Sparkles className="mr-2 h-4 w-4 text-indigo-300" />
          Upgrade Experience
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserCircle2 className="mr-2 h-4 w-4" />
          Account Core
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4 text-rose-300" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
