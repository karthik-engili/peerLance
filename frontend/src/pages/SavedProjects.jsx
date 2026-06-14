import React, { useEffect } from "react";
import { useSaved } from "../store/savedStore";
import { ProjectCard } from "../components/ProjectCard";
import { Loader } from "../components/Loader";
import { EmptyState } from "../components/EmptyState";

export const SavedProjects = () => {
  const { fetchSavedProjects, savedProjects, loading } = useSaved();

  useEffect(() => {
    fetchSavedProjects().catch(() => {});
  }, [fetchSavedProjects]);

  if (loading && savedProjects.length === 0) {
    return <Loader fullPage />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Saved Project Opportunities
        </h1>
        <p className="text-sm text-[#B3B3B3] mt-1">
          Keep track of bookmarked jobs and bid on them later.
        </p>
      </div>

      {savedProjects.length === 0 ? (
        <EmptyState
          title="No Bookmarks Found"
          description="Click the bookmark icon on any project card to save it here for quick access."
          actionText="Find Projects to Save"
          onAction={() => navigate("/projects")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

    </div>
  );
};
