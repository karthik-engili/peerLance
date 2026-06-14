import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useProject } from "../store/projectStore";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import { Upload, X, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

export const PostProject = () => {
  const navigate = useNavigate();
  const { createProject, loading } = useProject();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // File attachments state variables
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (!description.trim() || description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!skillsRequired.trim()) {
      toast.error("Skills required is a mandatory field");
      return;
    }
    if (!budgetMin || Number(budgetMin) <= 0) {
      toast.error("Enter a valid minimum budget");
      return;
    }
    if (!budgetMax || Number(budgetMax) < Number(budgetMin)) {
      toast.error("Maximum budget must be equal or greater than minimum budget");
      return;
    }
    if (!deadline) {
      toast.error("Please pick a project deadline date");
      return;
    }

    // Prepare multipart form data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    
    // Skills are comma separated, split and append individually
    skillsRequired.split(",").forEach((skill) => {
      formData.append("skillsRequired", skill.trim());
    });
    
    formData.append("budgetMin", Number(budgetMin));
    formData.append("budgetMax", Number(budgetMax));
    formData.append("deadline", deadline);

    // Append attachments
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const res = await createProject(formData);
      toast.success("Project posted successfully!");
      navigate(`/project/${res._id}`);
    } catch (err) {
      // Handled globally
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
        
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">
          Post a New Project
        </h2>
        <p className="text-[#B3B3B3] text-sm text-center mb-8 max-w-lg mx-auto">
          Reach qualified student talent by outlining your project requirements, skills required, and budget limitations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Opportunity Title"
            placeholder="e.g. Build responsive portfolio site with animations"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
                Category
              </label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select category"
              >
                <option value="" disabled className="bg-[#181818]">Pick category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#181818]">
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Skills Required (Comma separated)"
              placeholder="React, CSS, Tailwind, JavaScript"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
            />
          </div>

          <Textarea
            label="Detailed Description"
            placeholder="Outline objectives, key features, wireframes info, and delivery milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Input
              label="Minimum Budget (₹)"
              type="number"
              placeholder="e.g. 2000"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
            <Input
              label="Maximum Budget (₹)"
              type="number"
              placeholder="e.g. 5000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
            <Input
              label="Bidding Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Drag & Drop File Attachments Box */}
          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#B3B3B3] mb-2">
              Attach Reference Materials / Wireframes
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                dragActive ? "border-[#1DB954] bg-[#1DB954]/5" : "border-[#2A2A2A] bg-[#212121]/20 hover:border-[#1DB954]/50"
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                <Upload className="w-8 h-8 text-[#B3B3B3] mb-2 group-hover:text-white" />
                <span className="text-sm font-semibold text-white">
                  Drag files here or <span className="text-[#1DB954] hover:underline">browse</span>
                </span>
                <span className="text-xs text-[#B3B3B3] mt-1">
                  Supports Images, PDF documents, and Code files
                </span>
              </label>
            </div>

            {/* List of files selected */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#212121] border border-[#2A2A2A] rounded-xl text-xs font-semibold text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#1DB954]" />
                      <span className="truncate max-w-[250px]">{file.name}</span>
                      <span className="text-[10px] text-[#B3B3B3]">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-[#B3B3B3] hover:text-red-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#2A2A2A]">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="px-8 py-3">
              Post Opportunity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
