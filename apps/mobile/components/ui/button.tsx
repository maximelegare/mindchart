import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { TouchableOpacity } from "react-native";
import { TextClassContext } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/80 border border-primary/80 web:hover:opacity-90 active:opacity-90",
        destructive:
          "bg-destructive/50 border border-destructive-foreground/30 web:hover:opacity-90 active:opacity-90",
        outline:
          "border text-foreground border-[1px] border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        secondary: "bg-secondary web:hover:opacity-80 active:opacity-80",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline ",
      },
      size: {
        xs: "p1",
        default: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 native:h-14",
        icon: "h-14 w-14",
      },
      cornerRadius: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-[10000px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      cornerRadius: "md",
    },
  }
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-sm native:text-base font-medium web:transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "group-active:text-accent-foreground",
        secondary:
          "text-secondary-foreground group-active:text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
        link: "text-primary group-active:underline",
      },
      size: {
        default: "",
        sm: "",
        lg: "native:text-lg",
        icon: "",
        xs: "",
      },
      cornerRadius: {
        sm: "",
        md: "",
        lg: "",
        full: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      cornerRadius: "full",
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof TouchableOpacity> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(({ className, cornerRadius, variant, size, ...props }, ref) => {
  return (
    <TextClassContext.Provider
      value={cn(
        props.disabled && "web:pointer-events-none",
        buttonTextVariants({ variant, size, cornerRadius })
      )}
    >
      <TouchableOpacity
        className={cn(
          props.disabled && "opacity-50 web:pointer-events-none",
          buttonVariants({ variant, size, cornerRadius, className })
        )}
        ref={ref}
        role="button"
        {...props}
      >
        {props.children}
      </TouchableOpacity>
    </TextClassContext.Provider>
  );
});
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
