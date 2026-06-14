import React, { useState, useEffect } from "react";
import { useAuth } from "../store/authStore";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { StarRating } from "../components/StarRating";
import { ReviewCard } from "../components/ReviewCard";
import { User, Mail, Award, MessageSquare, Edit2, CheckCircle2 } from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export const Profile = () => {
  const { currentUser, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [skills, setSkills] = useState(currentUser?.skills?.join(", ") || "");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName || "");
      setBio(currentUser.bio || "");
      setSkills(currentUser.skills?.join(", ") || "");

      // Fetch reviews for freelancers
      if (currentUser.role === "FREELANCER") {
        setReviewsLoading(true);
        api
          .get(`/review/freelancer/${currentUser._id}`)
          .then((res) => {
            setReviews(res.data.payload.reviews);
            setAverageRating(res.data.payload.averageRating);
            setTotalReviews(res.data.payload.totalReviews);
          })
          .catch(() => {})
          .finally(() => setReviewsLoading(false));
      }
    }
  }, [currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await updateProfile({
        firstName,
        lastName,
        bio,
        skills: skillsArray,
      });

      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      // handled globally
    }
  };

  if (!currentUser) return null;

  const fullName = `${currentUser.firstName} ${currentUser.lastName || ""}`.trim();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Header Card */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="spotify-gradient absolute inset-0 opacity-40 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`}
              alt={fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover bg-[#212121] border border-[#2A2A2A]"
            />
            <div className="text-center sm:text-left">
              <span className="text-xs font-semibold text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {currentUser.role}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-1">
                {fullName}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-[#B3B3B3] mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#1DB954]" />
                  {currentUser.email}
                </span>
                {currentUser.role === "FREELANCER" && totalReviews > 0 && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={averageRating} size={14} />
                    <span className="text-xs font-bold text-white">({averageRating.toFixed(1)})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5"
          >
            {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? "View Profile" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* 2. Main Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Info / Skills) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Details / Skills View */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-3 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1DB954]" /> Skills & Tech
            </h3>
            {currentUser.skills && currentUser.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-semibold text-white bg-[#212121] border border-[#2A2A2A] px-3 py-1.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#B3B3B3] italic">No skills listed yet.</p>
            )}
          </div>

          {currentUser.role === "FREELANCER" && (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 text-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Freelancer Rating
              </h3>
              <div className="text-4xl font-black text-white mb-2">
                {averageRating ? averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex justify-center mb-2">
                <StarRating rating={averageRating} size={18} />
              </div>
              <p className="text-xs text-[#B3B3B3]">Based on {totalReviews} reviews</p>
            </div>
          )}
        </div>

        {/* Right Column (Editable Fields or Reviews) */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-[#2A2A2A] pb-3">
                Update Profile Information
              </h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <Textarea
                  label="Biography"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your expertise, background, or goals..."
                />

                <Input
                  label="Skills (Comma Separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, Express, JavaScript"
                />

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Biography Section */}
              <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-3 mb-4">
                  About Me
                </h3>
                <p className="text-sm text-[#B3B3B3] leading-relaxed whitespace-pre-line">
                  {currentUser.bio || "No biography details shared yet. Click Edit Profile to add one!"}
                </p>
              </div>

              {/* Reviews Section */}
              {currentUser.role === "FREELANCER" && (
                <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-3 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#1DB954]" /> Client Reviews ({totalReviews})
                  </h3>
                  {reviewsLoading ? (
                    <div className="py-8 text-center text-sm text-[#B3B3B3]">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#B3B3B3] italic bg-[#212121]/30 border border-[#2A2A2A] rounded-xl">
                      No reviews received yet. Completed projects will trigger client reviews.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
