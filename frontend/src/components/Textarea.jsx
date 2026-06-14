import React from "react";

export const Textarea = React.forwardRef(({
  label,
  error,
  placeholder,
  rows = 4,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={`w-full bg-[#181818] border ${
          error ? "border-red-500 focus:border-red-500" : "border-[#2A2A2A] focus:border-[#1DB954]"
        } text-white text-sm rounded-lg px-4 py-3 placeholder-[#535353] focus:outline-none focus:ring-2 focus:ring-[#1DB954]/20 transition-all duration-300 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-[#EF4444] font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";
