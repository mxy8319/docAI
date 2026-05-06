import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90",
        secondary: "bg-surface-container-low text-on-surface hover:bg-surface-container",
        ghost: "hover:bg-surface-container-low text-on-surface",
        outline: "border border-outline-variant bg-transparent hover:bg-surface-container-low",
        destructive: "bg-error text-on-error hover:bg-error/90",
      },
      size: {
        default: "h-12 px-6 py-3 text-label-md",
        sm: "h-10 px-4 py-2 text-label-sm",
        lg: "h-14 px-8 py-4 text-body-md",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
