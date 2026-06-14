import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useProject } from "../store/projectStore";
import { ProjectCard } from "../components/ProjectCard";
import { Pagination } from "../components/Pagination";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Loader } from "../components/Loader";
import { Search, SlidersHorizontal, Inbox } from "lucide-react";

export const ProjectListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchProjects, projects, currentPage, totalPages, loading } = useProject();

  // Search & Filter state variables
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [budgetMin, setBudgetMin] = useState(searchParams.get("budgetMin") || "");
  const [budgetMax, setBudgetMax] = useState(searchParams.get("budgetMax") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const categories = [
    "Web Development",
    "Mobile Development",
    "Graphic Design",
    "UI/UX Design",
    "Content Writing",
    "Data Science",
    "Marketing",
    "Other",
  ];

  // Fetch projects whenever parameters change
  useEffect(() => {
    const params = {
      page,
      limit: 9,
      status: "OPEN",
    };
    if (search) params.search = search;
    if (category) params.category = category;
    if (budgetMin) params.budgetMin = Number(budgetMin);
    if (budgetMax) params.budgetMax = Number(budgetMax);

    fetchProjects(params).catch(() => {});
  }, [page, search, category, budgetMin, budgetMax, fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateURL();
  };

  const updateURL = () => {
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (budgetMin) newParams.budgetMin = budgetMin;
    if (budgetMax) newParams.budgetMax = budgetMax;
    newParams.page = page.toString();
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBudgetMin("");
    setBudgetMax("");
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 h-fit">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4 mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#1DB954]" /> Filter Projects
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#1DB954] hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div>
              <Input
                label="Search Keyword"
                placeholder="e.g. React, logo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
                Category
              </label>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                placeholder="Select category"
              >
                <option value="" className="bg-[#181818]">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#181818]">
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
                Budget (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => {
                    setBudgetMin(e.target.value);
                    setPage(1);
                  }}
                  className="px-2"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => {
                    setBudgetMax(e.target.value);
                    setPage(1);
                  }}
                  className="px-2"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Projects Grid & Header */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Open Opportunities
            </h2>
            <span className="text-xs text-[#B3B3B3] font-semibold bg-[#212121] px-3 py-1.5 rounded-full border border-[#2A2A2A]">
              {projects.length} {projects.length === 1 ? "project" : "projects"} found
            </span>
          </div>

          {loading ? (
            <Loader />
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-[#181818] border border-[#2A2A2A] rounded-2xl py-20">
              <Inbox className="w-12 h-12 text-[#B3B3B3] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Matching Projects</h3>
              <p className="text-sm text-[#B3B3B3] max-w-sm mb-6">
                Try clearing search terms or modifying filters to explore opportunities.
              </p>
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-[#1DB954] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
};
