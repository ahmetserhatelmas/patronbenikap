"use client";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  confirmMessage: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function ConfirmSubmitButton({
  label,
  confirmMessage,
  variant = "destructive",
  size = "sm",
  className,
}: Props) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}
