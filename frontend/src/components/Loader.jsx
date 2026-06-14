import React from "react";
import { Loader2 } from "lucide-react";

export const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1DB954] animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-widest text-[#B3B3B3] uppercase">
          peerLance
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
    </div>
  );
};
