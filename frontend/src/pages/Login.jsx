import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../store/authStore";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import toast from "react-hot-toast";

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/";

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 4) {
      tempErrors.password = "Password must be at least 4 characters";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login({ email, password });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by axios global interceptor, but we can catch it silently here
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#121212]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black tracking-tight text-white">
          Sign in to <span className="text-[#1DB954]">peerLance</span>
        </h2>
        <p className="mt-2 text-sm text-[#B3B3B3]">
          Or{" "}
          <Link to="/register" className="font-semibold text-[#1DB954] hover:text-[#1ED760] hover:underline">
            create an account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#181818] border border-[#2A2A2A] py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
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
              placeholder="••••••••"
              error={errors.password}
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={loading}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
