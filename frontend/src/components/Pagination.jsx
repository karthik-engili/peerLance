import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between border-t border-[#2A2A2A] px-4 py-4 sm:px-6 mt-6 ${className}`}>
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#B3B3B3]">
            Showing Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-[#B3B3B3] ring-1 ring-inset ring-[#2A2A2A] hover:bg-[#212121] focus:z-20 focus:outline-offset-0 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 h-5" aria-hidden="true" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-[#2A2A2A] focus:z-20 cursor-pointer transition-all ${
                    isCurrent
                      ? "z-10 bg-[#1DB954] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DB954]"
                      : "text-[#B3B3B3] hover:bg-[#212121]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-[#B3B3B3] ring-1 ring-inset ring-[#2A2A2A] hover:bg-[#212121] focus:z-20 focus:outline-offset-0 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 h-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
