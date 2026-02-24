import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "shadow-xs inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap " +
  "focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50", {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]",
        secondary: "bg-[#E5E7EB] text-[#1F2937] hover:bg-[#D1D5DB] shadow-sm",
        ghost: "hover:bg-[#F3F4F6] hover:text-[#1F2937]",
        form: "bg-[#F9FAFB] text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F3F4F6]",
        link: "text-primary underline-offset-4 hover:underline shadow-none"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-8 w-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant, size, ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        type={props.type ?? "button"} // default to button as submit forms appear less
        className={cn(
          buttonVariants({ variant, size }),
          props.className
        )}
      >
        {props.children}
      </button>
    );
  });