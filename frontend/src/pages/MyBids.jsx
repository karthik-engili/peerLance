import React, { useEffect, useState } from "react";
import { useBid } from "../store/bidStore";
import { Link } from "react-router";
import { Loader } from "../components/Loader";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Clock, CheckCircle, XCircle, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export const MyBids = () => {
  const { fetchMyBids, myBids, withdrawBid, loading } = useBid();
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchMyBids().catch(() => {});
  }, [fetchMyBids]);

  const handleWithdraw = async (bidId) => {
    if (!window.confirm("Are you sure you want to withdraw this proposal? This action cannot be undone.")) return;
    try {
      await withdrawBid(bidId);
      toast.success("Proposal withdrawn successfully");
    } catch (err) {
      toast.error("Failed to withdraw proposal");
    }
  };

  const filteredBids = filterStatus === "ALL" 
    ? myBids 
    : myBids.filter((b) => b.status === filterStatus);

  if (loading && myBids.length === 0) {
    return <Loader fullPage />;
  }

  const statuses = [
    { label: "All Bids", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          My Submitted Proposals
        </h1>
        <p className="text-sm text-[#B3B3B3] mt-1">
          Review details, track responses, and manage bids.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A2A] pb-4 mb-6 overflow-x-auto">
        {statuses.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              filterStatus === tab.value
                ? "bg-[#1DB954] text-white border-[#1DB954]"
                : "bg-[#181818] text-[#B3B3B3] border-[#2A2A2A] hover:text-white hover:border-[#B3B3B3]/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBids.length === 0 ? (
        <EmptyState
          title="No Proposals Found"
          description={filterStatus === "ALL" 
            ? "You haven't submitted any proposals yet." 
            : `You don't have any proposals marked as ${filterStatus.toLowerCase()}.`
          }
          actionText="Find Projects to Bid"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBids.map((bid) => {
            const statusColors = {
              PENDING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
              ACCEPTED: "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20",
              REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
              WITHDRAWN: "bg-gray-500/10 text-gray-400 border-gray-500/20",
            };

            return (
              <div key={bid._id} className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#2A2A2A]/80 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full uppercase">
                      {bid.project?.category || "Tech"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[bid.status]}`}>
                      {bid.status}
                    </span>
                  </div>
                  
                  <Link to={`/project/${bid.project?._id || bid.project}`} className="text-lg font-bold text-white hover:text-[#1DB954] transition-colors leading-snug block">
                    {bid.project?.title || "Project Opportunity"}
                  </Link>

                  <p className="text-xs text-[#B3B3B3] mt-2 line-clamp-2 leading-relaxed">
                    {bid.coverNote}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 border-t border-[#2A2A2A] md:border-none pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-[#B3B3B3] block">Your bid</span>
                    <span className="text-base font-black text-white">₹{bid.proposedPrice}</span>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs text-[#B3B3B3] block">Timeline</span>
                    <span className="text-sm font-semibold text-white">{bid.deliveryDays} days</span>
                  </div>
                  
                  {bid.status === "PENDING" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleWithdraw(bid._id)}
                      className="px-4 py-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Withdraw
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
