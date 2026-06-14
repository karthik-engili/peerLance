import React from "react";
import { formatDistanceToNow } from "date-fns";
import { StarRating } from "./StarRating";

export const ReviewCard = ({ review }) => {
  const { reviewer, rating, comment, createdAt, project } = review;
  const fullName = reviewer 
    ? `${reviewer.firstName} ${reviewer.lastName || ""}`.trim() 
    : "Anonymous Client";

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#2A2A2A]/80 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={reviewer?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover bg-[#212121] border border-[#2A2A2A]"
          />
          <div>
            <h4 className="font-bold text-white text-sm">{fullName}</h4>
            {project?.title && (
              <p className="text-xs text-[#B3B3B3] mt-0.5">
                Reviewed for: <span className="text-white font-medium">{project.title}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={rating} size={14} />
          <span className="text-xs text-[#535353]">
            {formatDistanceToNow(new Date(createdAt))} ago
          </span>
        </div>
      </div>
      <p className="text-sm text-[#B3B3B3] leading-relaxed italic">
        "{comment}"
      </p>
    </div>
  );
};
