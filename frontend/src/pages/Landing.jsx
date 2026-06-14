import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Shield, Award, Users, FileText, CheckCircle2, TrendingUp, ArrowRight, Zap, Star } from "lucide-react";
import { useProject } from "../store/projectStore";
import { ProjectCard } from "../components/ProjectCard";
import { Button } from "../components/Button";
import { Loader } from "../components/Loader";

export const Landing = () => {
  const navigate = useNavigate();
  const { fetchProjects, projects, loading } = useProject();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch top projects for featured section
    fetchProjects({ limit: 3, page: 1, status: "OPEN" }).catch(() => {});
  }, [fetchProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/projects");
    }
  };

  const stats = [
    { value: "₹25L+", label: "Student Earnings" },
    { value: "5,000+", label: "Verified Users" },
    { value: "1,200+", label: "Completed Projects" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Gain Real Experience",
      desc: "Apply classroom knowledge to professional client tasks and build an impressive resume.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      desc: "Escrow-like system ensures you get paid for your work on time, every time.",
    },
    {
      icon: Award,
      title: "Build a Portfolio",
      desc: "Get reviews and stars from actual clients that demonstrate your coding or design competence.",
    },
  ];

  return (
    <div className="bg-[#121212] overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 spotify-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1DB954]/10 text-[#1DB954] mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#1DB954] animate-ping" />
            The Ultimate Freelance Hub for Student Creators
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Monetize Your Skills, <br />
            <span className="text-[#1DB954]">Accelerate Your Career</span>
          </h1>
          <p className="text-base sm:text-xl text-[#B3B3B3] max-w-2xl mx-auto mb-10 leading-relaxed">
            peerLance connects talented student developers, designers, and writers with clients looking for quality deliverables at competitive rates.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative">
            <div className="flex items-center bg-[#181818] border border-[#2A2A2A] hover:border-[#1DB954] focus-within:border-[#1DB954] focus-within:ring-2 focus-within:ring-[#1DB954]/25 rounded-full p-1.5 transition-all duration-300">
              <div className="pl-4 text-[#B3B3B3]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search projects (e.g. React Portfolio, Startup Logo...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder-[#535353]"
              />
              <Button type="submit" variant="primary" size="md">
                Search
              </Button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                Join as Student <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Post a Project
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 border-y border-[#2A2A2A] bg-[#181818]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, idx) => (
              <div key={idx}>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1DB954] mb-1">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#B3B3B3]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-4">
            How peerLance Works
          </h2>
          <p className="text-[#B3B3B3] max-w-xl mx-auto">
            Get started in three simple steps. No complex contracts or hidden commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-8 text-center relative hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] text-white font-extrabold text-sm ring-4 ring-[#121212]">
              1
            </div>
            <div className="flex items-center justify-center p-4 text-[#1DB954] bg-[#1DB954]/5 rounded-full w-16 h-16 mx-auto mb-6 mt-2">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Post or Browse</h3>
            <p className="text-sm text-[#B3B3B3]">
              Clients outline project briefs and budget ranges. Student freelancers find projects matching their skills.
            </p>
          </div>

          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-8 text-center relative hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] text-white font-extrabold text-sm ring-4 ring-[#121212]">
              2
            </div>
            <div className="flex items-center justify-center p-4 text-[#1DB954] bg-[#1DB954]/5 rounded-full w-16 h-16 mx-auto mb-6 mt-2">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bid & Align</h3>
            <p className="text-sm text-[#B3B3B3]">
              Freelancers bid with their proposals. Chat instantly via our real-time messenger to align on deliverables.
            </p>
          </div>

          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-8 text-center relative hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] text-white font-extrabold text-sm ring-4 ring-[#121212]">
              3
            </div>
            <div className="flex items-center justify-center p-4 text-[#1DB954] bg-[#1DB954]/5 rounded-full w-16 h-16 mx-auto mb-6 mt-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deliver & Get Rated</h3>
            <p className="text-sm text-[#B3B3B3]">
              Submit finished milestones, receive payouts securely, and gain client reviews to grow your presence.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section id="benefits" className="py-20 md:py-28 bg-[#181818]/40 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-4">
              Benefits For Students
            </h2>
            <p className="text-[#B3B3B3] max-w-xl mx-auto">
              Empowering the next generation of builders by connecting learning directly with earning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#1DB954]/30 transition-all">
                <div className="p-3 bg-[#1DB954]/10 rounded-lg text-[#1DB954] w-fit mb-4">
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-[#B3B3B3] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-3">
              Featured Opportunities
            </h2>
            <p className="text-[#B3B3B3]">
              Active bids are open for these student-friendly projects.
            </p>
          </div>
          <Link to="/projects" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#1DB954] hover:text-[#1ED760] transition-colors">
            View all projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : projects.length === 0 ? (
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-8 text-center text-[#B3B3B3]">
            No projects posted yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Testimonials */}
      <section className="py-20 md:py-28 bg-[#181818]/20 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-4">
              What Students & Clients Say
            </h2>
            <p className="text-[#B3B3B3]">
              Success stories from members of the peerLance portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=amit"
                  alt="Student Dev"
                  className="w-10 h-10 rounded-full bg-[#212121]"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Amit Sharma</h4>
                  <p className="text-xs text-[#B3B3B3]">Computer Engineering Student</p>
                </div>
              </div>
              <p className="text-sm text-[#B3B3B3] leading-relaxed italic">
                "As a sophomore, finding actual client work was impossible. On peerLance, I bid on a React dashboard, got accepted, and made my first ₹15,000 while building my portfolio!"
              </p>
              <div className="absolute right-6 top-6 text-[#1DB954]">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>

            <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=rachel"
                  alt="Client"
                  className="w-10 h-10 rounded-full bg-[#212121]"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Rachel Green</h4>
                  <p className="text-xs text-[#B3B3B3]">Founder, TechPulse Startup</p>
                </div>
              </div>
              <p className="text-sm text-[#B3B3B3] leading-relaxed italic">
                "I needed a web app mockup on a tight budget. The student we hired did outstanding work, communicated daily, and delivered a production-ready Figma design in under a week."
              </p>
              <div className="absolute right-6 top-6 text-[#1DB954]">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#181818] border-t border-[#2A2A2A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5 font-black text-xl text-white tracking-wider">
            <span className="text-[#1DB954]">peer</span>Lance
          </div>
          <p className="text-sm text-[#B3B3B3] text-center">
            &copy; 2026 peerLance Inc. Designed specifically for university students.
          </p>
          <div className="flex gap-4">
            <Link to="/#benefits" className="text-xs text-[#B3B3B3] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/#how-it-works" className="text-xs text-[#B3B3B3] hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
