import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange, paginationGroup }) {

    return (
        <>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-8 px-8 border-t border-white/5">
                    {/* Tombol Previous */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-[13px] font-semibold tracking-[0.01em] border ${currentPage === 1
                            ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 text-white/60 cursor-pointer hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]'
                            }`}>
                        <ChevronLeft size={15} />
                        Previous
                    </button>

                    {paginationGroup().map((item, index) => {
                        if (item === 'jump-prev') {
                            return (
                                <button key={'prev-' + index} onClick={() => onPageChange(currentPage - 3)}
                                        className="flex items-center cursor-pointer justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 bg-white/5 border border-white/10 text-white/50 text-[13px] font-semibold hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]">
                                        ...
                                </button>
                            )
                        }
                        if (item === 'jump-next') {
                            return (
                                <button key={'next-' + index} onClick={() => onPageChange(currentPage + 3)}
                                        className="flex items-center cursor-pointer justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 bg-white/5 border border-white/10 text-white/50 text-[13px] font-semibold hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]">
                                        ...
                                </button>
                            )
                        }
                        return (
                            <button key={item} onClick={() => onPageChange(item)}
                                    className={`flex items-center justify-center rounded-full transition-all duration-200 w-9.5 h-9.5 text-[13px] font-semibold cursor-pointer
                                    ${currentPage === item 
                                        ? 'bg-[#EE1D52] border-none text-white shadow-[0_0_12px_rgba(238,29,82,0.4)]' 
                                        : 'bg-white/5 border border-white/10 text-white/50 hover:bg-[#EE1D52]/10 hover:border-[#EE1D52]/30 hover:text-[#EE1D52]'}`}>
                                    {item}
                            </button>
                        )
                    })}

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
            )}
        </>
    )
}