import React from "react";

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  placeholder,
  className = "",
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full bg-[#181818] border ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-[#2A2A2A] focus:border-[#1DB954] focus:ring-[#1DB954]/20"
        } text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="text-[#535353]">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#181818] text-white">
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && (
        <p className="mt-1.5 text-xs text-[#EF4444] font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";
