import React, { useEffect } from "react";
import { Link } from "react-router";
import { useProject } from "../store/projectStore";
import { useAuth } from "../store/authStore";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";
import { EmptyState } from "../components/EmptyState";
import { Briefcase, FolderPlus, DollarSign, Activity, CheckCircle, FileText } from "lucide-react";

export const ClientDashboard = () => {
  const { fetchMyProjects, myProjects, loading } = useProject();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchMyProjects().catch(() => {});
  }, [fetchMyProjects]);

  if (loading && myProjects.length === 0) {
    return <Loader fullPage />;
  }

  // Calculate counters
  const openCount = myProjects.filter((p) => p.status === "OPEN").length;
  const activeCount = myProjects.filter((p) => p.status === "IN_PROGRESS").length;
  const completedCount = myProjects.filter((p) => p.status === "COMPLETED").length;

  const totalSpent = myProjects
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.acceptedBid?.proposedPrice || 0), 0);

  const stats = [
    { label: "Posted Projects", value: myProjects.length, icon: FileText, color: "text-blue-400 bg-blue-500/10" },
    { label: "Open Bids", value: openCount, icon: Activity, color: "text-[#1DB954] bg-[#1DB954]/10" },
    { label: "Active Jobs", value: activeCount, icon: Briefcase, color: "text-[#F59E0B] bg-[#F59E0B]/10" },
    { label: "Completed Jobs", value: completedCount, icon: CheckCircle, color: "text-[#1DB954] bg-[#1DB954]/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Client Dashboard
          </h1>
          <p className="text-sm text-[#B3B3B3] mt-1">
            Welcome back, {currentUser?.firstName}! Track your job opportunities, messages, and hires.
          </p>
        </div>
        <Link to="/project/post">
          <Button variant="primary" size="md" className="flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4" /> Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats row */}
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

      {/* Projects Table List */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-[#2A2A2A] flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Your Posted Projects</h3>
          <span className="text-xs text-[#B3B3B3] font-semibold bg-[#212121] border border-[#2A2A2A] px-2.5 py-1 rounded-full">
            Total {myProjects.length}
          </span>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No Jobs Posted Yet"
              description="Post your first project opportunity to connect with high-performing student freelancers."
              actionText="Post Project Now"
              onAction={() => navigate("/project/post")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#212121]/30">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">Project Info</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">Category</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">Budget Range</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#B3B3B3]">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#B3B3B3] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {myProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-[#212121]/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/project/${project._id}`} className="font-bold text-white hover:text-[#1DB954] block mb-1">
                        {project.title}
                      </Link>
                      <span className="text-xs text-[#535353]">
                        Posted on {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#B3B3B3]">
                      {project.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      ₹{project.budgetMin} - ₹{project.budgetMax}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        project.status === "OPEN"
                          ? "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20"
                          : project.status === "IN_PROGRESS"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/project/${project._id}`}>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
