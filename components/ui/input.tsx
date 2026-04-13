import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-14 w-full rounded-3xl border border-zinc-700 bg-zinc-950/70 px-4 text-base text-zinc-100 shadow-inner transition-all duration-300 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
