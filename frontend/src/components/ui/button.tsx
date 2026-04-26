import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[2px] focus-visible:ring-ring/40 focus-visible:border-ring",
  {
    variants: {
      variant: {
        default:
          "bg-[#D4A574] text-[#0A0A0A] hover:bg-[#C49564] active:scale-[0.98]",
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#DC2626]/90 active:scale-[0.98]",
        outline:
          "bg-transparent border border-[#262626] text-[#E5E5E5] hover:bg-[#1A1A1A] hover:border-[#333333] active:scale-[0.98]",
        ghost:
          "bg-transparent text-[#737373] hover:text-[#E5E5E5] hover:bg-[#1A1A1A]",
        link:
          "text-[#D4A574] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-[4px]",
        sm: "h-8 px-3.5 py-1.5 rounded-[4px] text-xs",
        lg: "h-11 px-6 py-2.5 rounded-[4px]",
        icon: "size-9 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };