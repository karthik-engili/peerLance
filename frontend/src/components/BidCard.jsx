import React from "react";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Calendar, ChevronRight, XCircle, CheckCircle } from "lucide-react";
import { StarRating } from "./StarRating";
import { Button } from "./Button";

export const BidCard = ({
  bid,
  showActions = false,
  isClient = false,
  onAccept,
  onReject,
  onWithdraw,
  loading = false,
}) => {
  const { freelancer, proposedPrice, deliveryDays, coverNote, status, createdAt } = bid;
  const fullName = freelancer 
    ? `${freelancer.firstName} ${freelancer.lastName || ""}`.trim() 
    : "Anonymous Freelancer";

  const statusBadges = {
    PENDING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    ACCEPTED: "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/30",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
    WITHDRAWN: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#2A2A2A]/80 transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* Freelancer Profile Summary */}
        <div className="flex items-start gap-4">
          <img
            src={freelancer?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
            alt={fullName}
            className="w-12 h-12 rounded-full object-cover bg-[#212121] border border-[#2A2A2A]"
          />
          <div>
            <h4 className="font-bold text-white text-base leading-snug">{fullName}</h4>
            {freelancer?.skills && freelancer.skills.length > 0 && (
              <p className="text-xs text-[#B3B3B3] mt-1 line-clamp-1">
                {freelancer.skills.slice(0, 4).join(" • ")}
              </p>
            )}
            <p className="text-xs text-[#535353] mt-1.5">
              Bid submitted {formatDistanceToNow(new Date(createdAt))} ago
            </p>
          </div>
        </div>

        {/* Pricing and Status badge */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t border-[#2A2A2A] md:border-none pt-3 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider block">Proposed bid</span>
            <span className="text-lg font-extrabold text-white flex items-center gap-0.5 md:justify-end mt-0.5">
              ₹{proposedPrice}
            </span>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider block">Duration</span>
            <span className="text-sm font-semibold text-white block mt-0.5">
              {deliveryDays} {deliveryDays === 1 ? "day" : "days"}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadges[status]}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Cover Note Section */}
      <div className="mt-4 p-4 bg-[#212121] border border-[#2A2A2A] rounded-lg">
        <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">Proposal Cover Letter</h5>
        <p className="text-sm text-[#B3B3B3] whitespace-pre-line leading-relaxed">
          {coverNote}
        </p>
      </div>

      {/* Action triggers */}
      {showActions && status === "PENDING" && (
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#2A2A2A]">
          {isClient ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onReject}
                disabled={loading}
                className="text-red-400 hover:text-red-300"
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onAccept}
                disabled={loading}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" /> Accept Bid
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={onWithdraw}
              disabled={loading}
            >
              Withdraw Bid
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
