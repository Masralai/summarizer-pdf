import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:bg-transparent file:text-sm file:font-medium placeholder:text-[#737373] " +
        "bg-[#111111] border border-[#262626] text-[#E5E5E5] " +
        "flex h-10 w-full rounded-[4px] px-3 py-1.5 text-sm " +
        "outline-none transition-colors duration-200 " +
        "focus-visible:border-[#D4A574]/50 focus-visible:ring-[2px] focus-visible:ring-[#D4A574]/20 " +
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export { Input };