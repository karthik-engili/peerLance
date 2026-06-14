import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Briefcase, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FREELANCER"); // default
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!firstName.trim()) tempErrors.firstName = "First name is required";
    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({ firstName, lastName, email, password, role });
      toast.success("Registration successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      // Handled globally
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#121212]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black text-white">
          Create your account on <span className="text-[#1DB954]">peerLance</span>
        </h2>
        <p className="mt-2 text-sm text-[#B3B3B3]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#1DB954] hover:text-[#1ED760] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#181818] border border-[#2A2A2A] py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Role selection toggle */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setRole("FREELANCER")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  role === "FREELANCER"
                    ? "border-[#1DB954] bg-[#1DB954]/5 text-white"
                    : "border-[#2A2A2A] bg-[#212121] text-[#B3B3B3] hover:border-[#535353]"
                }`}
              >
                <Briefcase className={`w-5 h-5 mb-2 ${role === "FREELANCER" ? "text-[#1DB954]" : ""}`} />
                <span className="text-sm font-bold">Freelancer</span>
                <span className="text-[10px] opacity-75 mt-1">I want to bid on work</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  role === "CLIENT"
                    ? "border-[#1DB954] bg-[#1DB954]/5 text-white"
                    : "border-[#2A2A2A] bg-[#212121] text-[#B3B3B3] hover:border-[#535353]"
                }`}
              >
                <UserCheck className={`w-5 h-5 mb-2 ${role === "CLIENT" ? "text-[#1DB954]" : ""}`} />
                <span className="text-sm font-bold">Client</span>
                <span className="text-[10px] opacity-75 mt-1">I want to hire talent</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Test"
                error={errors.firstName}
              />
              <Input
                label="Last Name (Optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="User"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@user.com"
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min 6 chars)"
              error={errors.password}
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={loading}
              >
                Create Free Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
