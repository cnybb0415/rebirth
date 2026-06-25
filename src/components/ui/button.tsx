import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,box-shadow,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90",
        secondary:
          "border border-foreground/15 bg-white text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md active:shadow-sm",
        outline:
          "border border-foreground/15 bg-white text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md active:shadow-sm",
        ghost:
          "border border-transparent bg-transparent shadow-none hover:border-foreground/15 hover:bg-[var(--surface-90)]",
        link: "underline underline-offset-4 hover:text-foreground",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
