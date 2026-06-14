import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There is nothing to display here right now.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-[#181818] border border-[#2A2A2A] rounded-2xl max-w-lg mx-auto">
      <div className="p-4 bg-[#212121] rounded-full text-[#B3B3B3] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#B3B3B3] max-w-xs mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
