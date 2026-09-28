'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items'
}) {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-neutral-400">
      <div className="font-mono">
        Showing <span className="font-bold text-white">{startItem}</span> to{' '}
        <span className="font-bold text-white">{endItem}</span> of{' '}
        <span className="font-bold text-[#C5A880]">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#2B2B2B] font-medium transition-colors ${
            currentPage === 1
              ? 'text-neutral-600 bg-[#141414] cursor-not-allowed opacity-50'
              : 'text-neutral-300 bg-[#181818] hover:border-[#C5A880] hover:text-[#C5A880] cursor-pointer'
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 rounded-lg text-xs font-mono font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-[#C5A880] text-[#0A0A0A] shadow-md shadow-[#C5A880]/20'
                  : 'border border-[#2B2B2B] bg-[#161616] text-neutral-400 hover:border-[#3D3D3D] hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#2B2B2B] font-medium transition-colors ${
            currentPage === totalPages
              ? 'text-neutral-600 bg-[#141414] cursor-not-allowed opacity-50'
              : 'text-neutral-300 bg-[#181818] hover:border-[#C5A880] hover:text-[#C5A880] cursor-pointer'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
