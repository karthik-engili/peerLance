import React from "react";
import { Link } from "react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/Button";

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[#121212]">
      <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-6">
        <ShieldAlert className="w-16 h-16 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
        Access Denied
      </h1>
      <p className="text-base text-[#B3B3B3] max-w-md mb-8">
        You do not have the required permissions or roles to view this page. If you believe this is an error, please check your account dashboard.
      </p>
      <Link to="/">
        <Button variant="primary">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
