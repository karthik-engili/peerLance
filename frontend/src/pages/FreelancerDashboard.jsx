import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useBid } from "../store/bidStore";
import { useSaved } from "../store/savedStore";
import { useAuth } from "../store/authStore";
import { Loader } from "../components/Loader";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Briefcase, Clock, Bookmark, Star, ArrowRight, DollarSign } from "lucide-react";
import api from "../api/axiosInstance";

export const FreelancerDashboard = () => {
  const { fetchMyBids, myBids, loading: bidsLoading } = useBid();
  const { fetchSavedProjects, savedIds, loading: savedLoading } = useSaved();
  const { currentUser } = useAuth();

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchMyBids().catch(() => {});
    fetchSavedProjects().catch(() => {});
    
    // Fetch profile reviews
    if (currentUser) {
      api
        .get(`/review/freelancer/${currentUser._id}`)
        .then((res) => {
          setAverageRating(res.data.payload.averageRating);
          setTotalReviews(res.data.payload.totalReviews);
        })
        .catch(() => {});
    }
  }, [fetchMyBids, fetchSavedProjects, currentUser]);

  if (bidsLoading || savedLoading) {
    return <Loader fullPage />;
  }

  // Calculate statistics
  const pendingBids = myBids.filter((b) => b.status === "PENDING");
  const acceptedBids = myBids.filter((b) => b.status === "ACCEPTED");

  const stats = [
    { label: "Pending Proposals", value: pendingBids.length, icon: Clock, color: "text-[#F59E0B] bg-[#F59E0B]/10" },
    { label: "Active Jobs", value: acceptedBids.length, icon: Briefcase, color: "text-[#1DB954] bg-[#1DB954]/10" },
    { label: "Saved Jobs", value: savedIds.length, icon: Bookmark, color: "text-blue-400 bg-blue-500/10" },
    { label: "Avg Rating", value: averageRating ? averageRating.toFixed(1) : "N/A", icon: Star, color: "text-[#F59E0B] bg-[#F59E0B]/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Freelancer Dashboard
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">
            Welcome back, {currentUser?.firstName}! Track your proposals, rating stars, and assignments.
          </p>
        </div>
        <Link to="/projects">
          <Button variant="primary" size="md" className="flex items-center gap-1.5">
            Browse Opportunities <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider block mb-1">
                {s.label}
              </span>
              <span className="text-2xl font-black text-white">
                {s.value}
              </span>
            </div>
            <div className={`p-3 rounded-full ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Recent proposals & quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Recent Proposals */}
        <div className="lg:col-span-2 bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-[#2A2A2A] flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Submitted Proposals</h3>
            <Link to="/freelancer/bids" className="text-xs font-semibold text-[#1DB954] hover:underline">
              View all
            </Link>
          </div>

          {myBids.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState
                title="No Proposals Yet"
                description="Browse active projects and submit bids to secure assignments."
                actionText="Find Projects"
                onAction={() => navigate("/projects")}
              />
            </div>
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {myBids.slice(0, 5).map((bid) => (
                <div key={bid._id} className="p-5 flex items-center justify-between hover:bg-[#212121]/10 transition-colors">
                  <div className="min-w-0 pr-4">
                    <Link to={`/project/${bid.project?._id || bid.project}`} className="font-bold text-white hover:text-[#1DB954] truncate block">
                      {bid.project?.title || "Project Opportunity"}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-[#B3B3B3] mt-1.5">
                      <span className="flex items-center gap-0.5">
                        ₹{bid.proposedPrice}
                      </span>
                      <span>•</span>
                      <span>{bid.deliveryDays} days delivery</span>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      bid.status === "PENDING"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                        : bid.status === "ACCEPTED"
                        ? "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Quick Navigation shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#2A2A2A] pb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-3">
              <Link to="/profile">
                <Button variant="secondary" className="w-full justify-start text-sm">
                  👤 Edit Resume / Bio
                </Button>
              </Link>
              <Link to="/freelancer/saved">
                <Button variant="secondary" className="w-full justify-start text-sm">
                  🔖 Saved Opportunities ({savedIds.length})
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="secondary" className="w-full justify-start text-sm">
                  💬 Project Chat Rooms
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
