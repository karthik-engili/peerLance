import React from "react";
import { Star } from "lucide-react";

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onChange,
  className = "",
  size = 18,
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={`${interactive ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"} transition-transform focus:outline-none`}
          >
            <Star
              size={size}
              className={`transition-colors duration-200 ${
                isFilled
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-[#535353] fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
