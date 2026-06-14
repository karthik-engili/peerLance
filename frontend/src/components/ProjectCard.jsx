import React, { useState } from "react";
import { Link } from "react-router";
import { Bookmark, Clock, DollarSign, Briefcase } from "lucide-react";
import { formatDistanceToNow, isAfter } from "date-fns";
import { useSaved } from "../store/savedStore";
import { useAuth } from "../store/authStore";
import toast from "react-hot-toast";

export const ProjectCard = ({ project }) => {
  const { currentUser } = useAuth();
  const { toggleSave, isSaved } = useSaved();
  const [saving, setSaving] = useState(false);

  const isBookmarked = isSaved(project._id);
  const isFreelancer = currentUser?.role === "FREELANCER";

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFreelancer) {
      toast.error("Only freelancers can save projects");
      return;
    }
    setSaving(true);
    try {
      const res = await toggleSave(project._id);
      toast.success(res.saved ? "Project bookmarked!" : "Bookmark removed");
    } catch (err) {
      toast.error("Failed to bookmark project");
    } finally {
      setSaving(false);
    }
  };

  const hasDeadlinePassed = !isAfter(new Date(project.deadline), new Date());
  const formattedDeadline = hasDeadlinePassed
    ? "Deadline passed"
    : `Closes in ${formatDistanceToNow(new Date(project.deadline))}`;

  // Status badges
  const statusColors = {
    OPEN: "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/30",
    IN_PROGRESS: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] hover:border-[#1DB954]/50 rounded-xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-semibold text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {project.category}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[project.status]}`}>
              {project.status}
            </span>
            {isFreelancer && (
              <button
                type="button"
                onClick={handleBookmark}
                disabled={saving}
                className={`p-1.5 rounded-full border border-[#2A2A2A] bg-[#212121] transition-all ${
                  isBookmarked 
                    ? "text-[#1DB954] border-[#1DB954]/30" 
                    : "text-[#B3B3B3] hover:text-white hover:border-[#B3B3B3]/30"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-[#1DB954]" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/project/${project._id}`}>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1DB954] transition-colors leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="text-sm text-[#B3B3B3] line-clamp-3 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Skills required pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.skillsRequired?.map((skill, index) => (
            <span
              key={index}
              className="text-xs text-[#B3B3B3] bg-[#212121] border border-[#2A2A2A] px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between mt-auto">
        <div className="flex items-center text-sm text-[#B3B3B3] gap-1.5">
          <DollarSign className="w-4 h-4 text-[#1DB954]" />
          <span className="font-semibold text-white">
            ₹{project.budgetMin} - ₹{project.budgetMax}
          </span>
        </div>
        <div className="flex items-center text-xs text-[#B3B3B3] gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDeadline}</span>
        </div>
      </div>
    </div>
  );
};
