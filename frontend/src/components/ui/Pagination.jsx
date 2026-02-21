import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange }) {
    // Logika pintar untuk membatasi maksimal 7 angka pagination yang tampil
    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        if (totalPages <= 7) return i + 1;
        if (currentPage <= 4) return i + 1;
        if (currentPage >= totalPages - 3) return totalPages - 6 + i;
        return currentPage - 3 + i;
    });

    return (
        <div className="flex items-center justify-center gap-3 py-12 px-8 border-t border-white/5">

            {/* Tombol Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-[13px] font-semibold tracking-[0.01em] border ${currentPage === 1
                        ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white/60 cursor-pointer hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]'
                    }`}
            >
                <ChevronLeft size={15} />
                Previous
            </button>

            {/* Barisan Angka Halaman */}
            <div className="flex items-center gap-1.5 md:flex">

                {/* Angka '1' Statis (Muncul jika halaman > 4) */}
                {currentPage > 4 && totalPages > 7 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="flex items-center justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 bg-white/5 border border-white/10 text-white/50 text-[13px] font-semibold hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]"
                        >
                            1
                        </button>
                        <span className="text-white/25 text-[13px] px-1">···</span>
                    </>
                )}

                {/* Angka Halaman Dinamis */}
                {pages.map(page => {
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`flex items-center justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 text-[13px] ${isActive
                                    ? 'bg-linear-to-br from-[#EE1D52] to-[#c01240] border border-transparent text-white font-bold shadow-[0_4px_16px_rgba(238,29,82,0.45)]'
                                    : 'bg-white/5 border border-white/10 text-white/50 font-medium hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Angka Terakhir Statis (Muncul jika masih jauh dari akhir) */}
                {currentPage < totalPages - 3 && totalPages > 7 && (
                    <>
                        <span className="text-white/25 text-[13px] px-1">···</span>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="flex items-center justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 bg-white/5 border border-white/10 text-white/50 text-[13px] font-semibold hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            {/* Label Indikator Tengah */}
            <div className="px-4 py-2 rounded-full mx-1 bg-white/5 border border-white/10 text-[12px] font-semibold text-white/35 tracking-[0.04em]">
                Page {currentPage} of {totalPages}
            </div>

            {/* Tombol Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-[13px] font-semibold tracking-[0.01em] border ${currentPage === totalPages
                        ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white/60 cursor-pointer hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]'
                    }`}
            >
                Next
                <ChevronRight size={15} />
            </button>

        </div>
    );
}