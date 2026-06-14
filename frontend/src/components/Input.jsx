import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = React.forwardRef(({
  label,
  type = "text",
  error,
  placeholder,
  className = "",
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`w-full bg-[#181818] border ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-[#2A2A2A] focus:border-[#1DB954] focus:ring-[#1DB954]/20"
          } text-white text-sm rounded-lg px-4 py-3 placeholder-[#535353] focus:outline-none focus:ring-2 transition-all duration-300 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-[#EF4444] font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
