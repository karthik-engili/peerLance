import React from "react";
import { Link } from "react-router";
import { HelpCircle } from "lucide-react";
import { Button } from "../components/Button";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-[#121212]">
      <div className="p-4 bg-[#212121] rounded-full text-[#B3B3B3] mb-6">
        <HelpCircle className="w-16 h-16 animate-pulse" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-base text-[#B3B3B3] max-w-md mb-8">
        The link you followed may be broken or the page might have been removed. Let's get you back on track!
      </p>
      <Link to="/">
        <Button variant="primary">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
