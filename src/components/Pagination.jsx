import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
}) {
  if (totalPages <= 1 && totalItems <= limit) {
    if (!onLimitChange && totalPages <= 1) return null;
  }

  const maxPages = Math.max(totalPages, 1);

  const getPageNumbers = () => {
    if (maxPages <= 7) {
      return Array.from({ length: maxPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', maxPages];
    }
    if (currentPage >= maxPages - 3) {
      return [1, '...', maxPages - 4, maxPages - 3, maxPages - 2, maxPages - 1, maxPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', maxPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white text-xs text-slate-600">
      {/* Limit Selector */}
      {onLimitChange ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Tampilkan:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="hidden sm:inline text-slate-400">data per halaman</span>
        </div>
      ) : (
        <div />
      )}

      {/* Pagination controls with page numbers */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-1.5 py-1 text-slate-400 font-bold select-none">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center ${
                  p === currentPage
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= maxPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors cursor-pointer"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

