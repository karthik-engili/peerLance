import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg bg-[#181818] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-300 ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#212121] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
