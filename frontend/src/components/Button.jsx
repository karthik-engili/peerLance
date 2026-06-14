import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#1DB954] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-[#1DB954] text-white hover:bg-[#1ED760] shadow-md shadow-[#1DB954]/10",
    secondary: "bg-[#212121] text-[#B3B3B3] hover:text-white border border-[#2A2A2A] hover:bg-[#2A2A2A]",
    danger: "bg-[#EF4444] text-white hover:bg-[#ef4444]/90",
    outline: "bg-transparent text-[#1DB954] border border-[#1DB954] hover:bg-[#1DB954]/10",
    text: "bg-transparent text-[#B3B3B3] hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
};
