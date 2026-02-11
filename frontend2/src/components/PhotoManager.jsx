import { Search, X, User, Filter, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_BACKEND_URL

export default function PhotoManager({ photos, selectedMember, queryParams, onClearFilter, onMemberClick, loading, pagingInfo, setQueryParams }) {
    const [searchInput, setSearchInput] = useState(queryParams?.search || '')
    const displayedPhotos = photos;
    const TARGET_SLOTS = 32;
    const emptySlotsCount = Math.max(0, TARGET_SLOTS - displayedPhotos.length);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagingInfo.total_page) {
            setQueryParams(prev => ({ ...prev, page: newPage }))
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setQueryParams(prev => {
                if (prev.search !== searchInput) {
                    return {
                        ...prev,
                        search: searchInput,
                        page: 1
                    }
                }
                return prev
            })
        }, 500)
        return () => clearTimeout(handler)
    }, [searchInput, queryParams])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-5 relative py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Scraped Photos</h3>
                {loading && (
                    <p className="text-xs top-10 absolute text-[#EE1D52] animate-pulse font-medium">
                        Sedang memuat data...
                    </p>
                )}
                <div className={`flex items-center border rounded-lg overflow-hidden transition-all duration-300 ${selectedMember ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-300 border-dashed'}`}>

                    <button
                        onClick={onMemberClick}
                        className={`px-3 py-1.5 hover:bg-blue-100 hover:cursor-pointer flex items-center gap-2 text-sm font-medium transition 
                                ${selectedMember
                                ? 'text-blue-700 hover:bg-blue-100 cursor-pointer'
                                : 'text-slate-500 cursor-default'
                            }`}
                        title={selectedMember ? "Back to Member List" : "No filter active"}>
                        {selectedMember ? (
                            <>
                                <User size={14} />
                                {selectedMember.nickname}
                            </>
                        ) : (
                            <>
                                <Filter size={14} />
                                Filter Member
                            </>
                        )}
                    </button>

                    {selectedMember && (
                        <button
                            onClick={onClearFilter}
                            className="px-2 py-1.5 border-l border-blue-200 hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                            title="Clear Filter">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search caption..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none" />
                </div>
            </div>
            <div className="py-3 px-5 ">
                {loading ? (
                    <div className="flex h-192.75 flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="animate-spin text-[#EE1D52]" size={32} />
                        <span className="text-sm font-medium">Memuat foto...</span>
                    </div>
                ) : displayedPhotos.length === 0 ? (
                    <div className="flex h-192.75 items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-center">
                            <p className="font-medium">Belum ada foto yang discrape.</p>
                            <p className="text-xs mt-1">Jalankan bot scraper terlebih dahulu.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-8 gap-4">
                        {displayedPhotos.map((photo) => (
                            <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-slate-200 aspect-square shadow-sm hover:shadow-md transition-all">
                                <img
                                    src={`${API_URL}${photo.srcUrl}`}
                                    alt={photo.caption || "Foto JKT48"}
                                    className="w-full h-full object-cover bg-slate-100"
                                    onError={(e) => {
                                        e.target.src = "https://placehold.co/400?text=Image+Error"
                                    }}
                                />

                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
                                    <div className="mb-1">
                                        <span className="inline-block px-1.5 py-0.5 bg-[#EE1D52] text-white text-[10px] font-bold rounded-sm mb-1">
                                            {photo.member?.nickname || 'Unknown'}
                                        </span>
                                    </div>
                                    <p className="text-white text-xs line-clamp-2 mb-2 leading-tight">
                                        {photo.caption || "No Caption"}
                                    </p>
                                    <div className="flex items-center text-white/60 text-[10px] gap-1">
                                        <Calendar size={10} />
                                        {new Date(photo.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {photo.mediaType === 'CAROUSEL_ALBUM' && (
                                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M9 3v18" /><path d="m14 8 2 2-2 2" /><path d="m14 16 2-2-2-2" /></svg>
                                    </div>
                                )}
                            </div>
                        ))}
                        {[...Array(emptySlotsCount)].map((_, index) => (
                            <div key={`empty-${index}`} className="aspect-square rounded-lg"></div>
                        ))}
                    </div>
                )}

                <div className="p-3 pb-0 flex items-center justify-between bg-slate-50/50">
                    <span className="text-sm text-slate-500">
                        Total: <span className="font-semibold">
                            {pagingInfo?.total_item || 0}
                        </span> photos
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagingInfo.page - 1)}
                            disabled={pagingInfo?.page === 1}
                            className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-sm font-medium px-2">
                            Page {pagingInfo.page} of {pagingInfo.total_page || 1}
                        </span>

                        <button
                            onClick={() => handlePageChange(pagingInfo.page + 1)}
                            disabled={pagingInfo.page >= pagingInfo.total_page}
                            className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}