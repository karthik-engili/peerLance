import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useProject } from "../store/projectStore";
import { useBid } from "../store/bidStore";
import { useAuth } from "../store/authStore";
import { useSaved } from "../store/savedStore";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Loader } from "../components/Loader";
import { BidCard } from "../components/BidCard";
import { StarRating } from "../components/StarRating";
import { formatDistanceToNow, isAfter } from "date-fns";
import { DollarSign, Clock, User, Briefcase, Paperclip, MessageSquare, Star } from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { fetchProjectById, currentProject, completeProject, loading: projectLoading } = useProject();
  const { submitBid, acceptBid, rejectBid, bids: projectBids, fetchBidsForProject } = useBid();
  const { currentUser, isAuthenticated } = useAuth();
  const { toggleSave, isSaved } = useSaved();

  // Modal open triggers
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Bid submission form states
  const [proposedPrice, setProposedPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);

  // Review submission form states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // General action loader
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProjectById(id).catch(() => {});
    fetchBidsForProject(id).catch(() => {});
  }, [id, fetchProjectById, fetchBidsForProject]);

  const handleBookmarkToggle = async () => {
    if (currentUser?.role !== "FREELANCER") {
      toast.error("Only freelancers can save projects");
      return;
    }
    try {
      const res = await toggleSave(currentProject._id);
      toast.success(res.saved ? "Project bookmarked!" : "Bookmark removed");
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!proposedPrice || proposedPrice <= 0) {
      toast.error("Enter a valid proposed price");
      return;
    }
    if (!deliveryDays || deliveryDays <= 0) {
      toast.error("Enter valid delivery days");
      return;
    }
    if (!coverNote.trim()) {
      toast.error("Please add a cover letter");
      return;
    }

    setBidSubmitting(true);
    try {
      await submitBid({
        projectId: currentProject._id,
        proposedPrice: Number(proposedPrice),
        deliveryDays: Number(deliveryDays),
        coverNote,
      });
      toast.success("Proposal submitted successfully!");
      setBidModalOpen(false);
      // Refresh details
      fetchBidsForProject(currentProject._id);
    } catch (err) {
      // Handled globally
    } finally {
      setBidSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to accept this bid? It will assign the project and reject all other pending bids.")) return;
    setActionLoading(true);
    try {
      await acceptBid(bidId);
      toast.success("Bid accepted!");
      fetchProjectById(id);
      fetchBidsForProject(id);
    } catch (err) {
      // Handled globally
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm("Reject this bid?")) return;
    setActionLoading(true);
    try {
      await rejectBid(bidId);
      toast.success("Bid rejected");
      fetchBidsForProject(id);
    } catch (err) {
      // Handled globally
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!window.confirm("Mark this project as completed? This will lock payments and allow you to review the freelancer.")) return;
    setActionLoading(true);
    try {
      await completeProject(currentProject._id);
      toast.success("Project marked completed!");
      fetchProjectById(id);
    } catch (err) {
      // Handled globally
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    setReviewSubmitting(true);
    try {
      await api.post("/review", {
        projectId: currentProject._id,
        rating,
        comment: reviewComment,
      });
      toast.success("Review submitted!");
      setReviewModalOpen(false);
      fetchProjectById(id);
    } catch (err) {
      // Handled globally
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (projectLoading || !currentProject) {
    return <Loader fullPage />;
  }

  const isOwner = currentUser?._id === currentProject.client?._id;
  const isFreelancer = currentUser?.role === "FREELANCER";
  const hasApplied = projectBids.some((b) => b.freelancer?._id === currentUser?._id);

  const closesIn = !isAfter(new Date(currentProject.deadline), new Date())
    ? "Deadline passed"
    : `Closes in ${formatDistanceToNow(new Date(currentProject.deadline))}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Main Project Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-xs font-semibold text-[#1DB954] bg-[#1DB954]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {currentProject.category}
              </span>
              <span className="text-xs font-bold text-[#B3B3B3]">
                Posted {formatDistanceToNow(new Date(currentProject.createdAt))} ago
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-6">
              {currentProject.title}
            </h1>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#2A2A2A] py-5 mb-6">
              <div className="text-center sm:text-left">
                <span className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-1">Budget Range</span>
                <span className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-0.5">
                  ₹{currentProject.budgetMin} - ₹{currentProject.budgetMax}
                </span>
              </div>
              <div className="text-center sm:text-left border-x border-[#2A2A2A] px-4">
                <span className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-1">Timeline</span>
                <span className="text-base sm:text-lg font-black text-white flex items-center justify-center sm:justify-start gap-1">
                  <Clock className="w-4 h-4 text-[#1DB954] hidden sm:block" /> {closesIn}
                </span>
              </div>
              <div className="text-center sm:text-left pl-4">
                <span className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-1">Bids Received</span>
                <span className="text-base sm:text-lg font-black text-[#1DB954] block">
                  {projectBids.length} proposals
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Description</h3>
              <p className="text-sm text-[#B3B3B3] leading-relaxed whitespace-pre-line">
                {currentProject.description}
              </p>
            </div>

            {/* Skills required */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {currentProject.skillsRequired?.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold text-white bg-[#212121] border border-[#2A2A2A] px-3 py-1.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments */}
            {currentProject.attachments && currentProject.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attachments</h3>
                <div className="space-y-2">
                  {currentProject.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-[#212121] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-xl text-xs font-semibold text-white transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-[#1DB954]" /> Download Attachment File {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bids Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isOwner ? "Received Proposals" : "Proposals"} ({projectBids.length})
            </h3>
            
            {projectBids.length === 0 ? (
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-8 text-center text-[#B3B3B3] text-sm">
                No bids submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {projectBids.map((bid) => {
                  const showBidActions = isOwner || bid.freelancer?._id === currentUser?._id;
                  return (
                    <BidCard
                      key={bid._id}
                      bid={bid}
                      showActions={showBidActions}
                      isClient={isOwner}
                      onAccept={() => handleAcceptBid(bid._id)}
                      onReject={() => handleRejectBid(bid._id)}
                      loading={actionLoading}
                    />
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right: Actions sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Action Card */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#2A2A2A] pb-3">
              Project Lifecycle
            </h3>
            <div className="space-y-4">
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#B3B3B3]">Status:</span>
                <span className="font-bold text-[#1DB954]">{currentProject.status}</span>
              </div>

              {/* Freelancer bidding button */}
              {isFreelancer && currentProject.status === "OPEN" && (
                <>
                  <Button
                    variant="primary"
                    className="w-full py-3"
                    disabled={hasApplied}
                    onClick={() => setBidModalOpen(true)}
                  >
                    {hasApplied ? "Proposal Already Submitted" : "Submit Proposal"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleBookmarkToggle}
                  >
                    {isSaved(currentProject._id) ? "Remove Bookmark" : "Bookmark Project"}
                  </Button>
                </>
              )}

              {/* Client controls */}
              {isOwner && (
                <>
                  {currentProject.status === "IN_PROGRESS" && (
                    <Button
                      variant="primary"
                      className="w-full py-3"
                      onClick={handleCompleteProject}
                      disabled={actionLoading}
                    >
                      Complete Project
                    </Button>
                  )}
                  {currentProject.status === "COMPLETED" && !currentProject.reviewSubmitted && (
                    <Button
                      variant="primary"
                      className="w-full py-3"
                      onClick={() => setReviewModalOpen(true)}
                    >
                      Write Client Review
                    </Button>
                  )}
                  {currentProject.status === "COMPLETED" && currentProject.reviewSubmitted && (
                    <div className="text-xs text-center text-green-400 font-semibold p-2 bg-[#1DB954]/10 rounded border border-[#1DB954]/20">
                      Review submitted!
                    </div>
                  )}
                </>
              )}

              {/* Chat action if IN_PROGRESS or COMPLETED */}
              {isAuthenticated && (isOwner || hasApplied) && currentProject.status !== "OPEN" && (
                <Link to="/chat">
                  <Button variant="outline" className="w-full py-3 mt-2 flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Open Live Chat
                  </Button>
                </Link>
              )}

            </div>
          </div>

          {/* Client Profile Info Card */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 text-center">
            <h4 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider mb-4">Posted By Client</h4>
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentProject.client?.firstName}`}
              alt="Client avatar"
              className="w-16 h-16 rounded-full mx-auto object-cover bg-[#212121] border border-[#2A2A2A] mb-3"
            />
            <h3 className="font-bold text-white text-base">
              {currentProject.client?.firstName} {currentProject.client?.lastName || ""}
            </h3>
            <p className="text-xs text-[#B3B3B3] mt-1">
              Member since {new Date(currentProject.client?.createdAt || Date.now()).getFullYear()}
            </p>
          </div>

        </div>

      </div>

      {/* 2. Submit Bid Modal */}
      <Modal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        title="Submit Proposal"
      >
        <form onSubmit={handleBidSubmit} className="space-y-5">
          <Input
            label="Proposed Price (₹)"
            type="number"
            placeholder="e.g. 3000"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
          />

          <Input
            label="Delivery Timeline (Days)"
            type="number"
            placeholder="e.g. 5"
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(e.target.value)}
          />

          <Textarea
            label="Why are you a good fit?"
            placeholder="Write a cover letter outlining your skills, experience, and strategy..."
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
            <Button variant="secondary" onClick={() => setBidModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={bidSubmitting}>
              Submit Proposal
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Review Submission Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Submit Freelancer Review"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-3">
              Your Rating
            </label>
            <StarRating
              rating={rating}
              interactive
              onChange={(val) => setRating(val)}
              size={24}
            />
          </div>

          <Textarea
            label="Feedback Review Comment"
            placeholder="Describe your working experience, timeliness, quality..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={reviewSubmitting}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
