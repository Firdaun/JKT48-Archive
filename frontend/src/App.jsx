import { useState } from 'react';
import { StoryCarousel } from './components/ui/StoryCarousel';
import { FloatingControlBar } from './components/ui/FloatingControlBar';
import { GalleryGrid } from './components/ui/GalleryGrid';
import { useSearchParams } from 'react-router'
import { Lightbox } from './components/ui/Lightbox';
import { Pagination } from './components/ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Sparkles, Bell } from 'lucide-react';
import { photoApi } from './lib/photo-api';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

const isVideoFile = (url, type) => {
    return type === 'VIDEO' || (url && url.endsWith('.mp4'));
};

export default function App() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Membaca state dari URL agar bisa di-share/refresh
    const source = searchParams.get('source') || 'All';
    const nickname = searchParams.get('nickname') || '';
    const page = parseInt(searchParams.get('page') || '1');

    // Local State
    const [viewMode, setViewMode] = useState('album');
    const [searchInput, setSearchInput] = useState(nickname);
    const [lightboxItem, setLightboxItem] = useState(null);

    const photoQueryParams = {
        page: page,
        size: viewMode === 'album' ? 8 : 40, // 8 untuk album (besar), 40 untuk grid rapat
        source: source === 'All' ? '' : source.toLowerCase(),
        nickname: nickname,
        mode: viewMode === 'grid' ? 'photo' : 'album',
        post_url: ''
    };

    // Fetching Data dengan React Query
    const imgQuery = useQuery({
        queryKey: ['public-photos', photoQueryParams],
        queryFn: () => photoApi.getPublicPhotos(photoQueryParams),
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 30,
    });

    const photos = imgQuery.data?.data || [];
    const paging = imgQuery.data?.paging;
    const maxPage = paging?.total_page || 1;

    // MAPPING: Mengubah format API ke format yang dibutuhkan UI (GalleryCard / Lightbox)
    const mappedPhotos = photos.map((item) => ({
        id: item.id || Math.random().toString(),
        image: `${API_URL}${item.srcUrl}`,
        caption: item.caption || "Tanpa Caption",
        isVideo: isVideoFile(item.srcUrl, item.mediaType),
        platform: item.source ? item.source.charAt(0).toUpperCase() + item.source.slice(1) : 'Instagram',
        date: new Date(item.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        likes: item.likes || 0,
        comments: item.comments || 0,
        member: nickname || 'JKT48',
        aspectRatio: 'portrait', // Mock ratio agar masonry rapi
        originalData: item // Simpan data asli jika dibutuhkan
    }));

    // Handlers URL Params
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('page', newPage);
                return newParams;
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePlatformChange = (p) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (p === 'All') newParams.delete('source');
            else newParams.set('source', p);
            newParams.set('page', 1);
            return newParams;
        });
    };

    const handleMemberSelect = (memberName) => {
        setSearchInput(memberName);
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (memberName) newParams.set('nickname', memberName);
            else newParams.delete('nickname');
            newParams.set('page', 1);
            return newParams;
        });
    };

    // Debounce Search Input
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchParams(prev => {
                const currentNickname = prev.get('nickname') || '';
                if (currentNickname !== searchInput) {
                    const newParams = new URLSearchParams(prev);
                    if (searchInput) newParams.set('nickname', searchInput);
                    else newParams.delete('nickname');
                    newParams.set('page', 1);
                    return newParams;
                }
                return prev;
            }, { replace: true });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInput, setSearchParams]);

    return (
        <div className="min-h-screen font-jakarta bg-[#07070f] text-white relative overflow-x-hidden">

            {/* ─── Background Decorative Gradients ─── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-50 -left-50 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(238,29,82,0.06)_0%,transparent_70%)] blur-[60px]" />
                <div className="absolute top-25 -right-50 w-125 h-125 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.05)_0%,transparent_70%)] blur-[60px]" />
                <div className="absolute bottom-50 left-[40%] w-100 h-100 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.04)_0%,transparent_70%)] blur-[80px]" />
            </div>

            <header className="sticky top-0 z-50 px-8 py-4 bg-[rgba(7,7,15,0.85)] backdrop-blur-2xl border-b border-white/6">
                <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-xl w-10 h-10 bg-linear-to-br from-[#EE1D52] to-[#c01240] shadow-[0_4px_20px_rgba(238,29,82,0.45)]">
                            <Sparkles size={18} color="white" />
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[20px] font-extrabold tracking-[-0.02em] bg-linear-to-br from-white to-white/70 bg-clip-text text-transparent">
                                    JKT48
                                </span>
                                <span className="text-[12px] font-bold text-[#EE1D52] tracking-[0.08em] uppercase bg-[rgba(238,29,82,0.12)] px-1.75 py-px rounded-md border border-[rgba(238,29,82,0.3)]">
                                    Media
                                </span>
                            </div>
                            <p className="text-[10px] text-white/30 font-medium tracking-[0.04em] -mt-0.5">
                                Official Fan Gallery
                            </p>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {['Gallery', 'Schedule', 'Theater', 'Fan Club', 'Shop'].map((item, i) => (
                            <button
                                key={item}
                                className={`
                            relative pb-1 bg-transparent border-none cursor-pointer text-[13px] tracking-[0.01em] transition-colors duration-200
                            ${i === 0 ? 'font-bold text-white' : 'font-medium text-white/40 hover:text-white/75'}`}
                            >
                                {item}
                                {i === 0 && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-[#EE1D52] to-[#ff6b9d]" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">

                        {/* Notification */}
                        <button className="relative flex items-center justify-center rounded-full w-9.5 h-9.5 bg-white/6 border border-white/10 text-white/60 transition-all duration-200">
                            <Bell size={15} />
                            <span className="absolute top-1.5 right-1.5 w-1.75 h-1.75 rounded-full bg-[#EE1D52] shadow-[0_0_8px_#EE1D52]" />
                        </button>

                        {/* Total items badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[12px] font-semibold text-white/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] inline-block" />
                            {/* {galleryData.length * TOTAL_PAGES} Items */} 160 Items
                        </div>

                        {/* CTA Button */}
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-br from-[#EE1D52] to-[#c01240] text-[13px] font-bold text-white border-none cursor-pointer tracking-[0.01em] shadow-[0_4px_16px_rgba(238,29,82,0.35)] transition-all duration-200">
                            <Sparkles size={13} />
                            Fan Club
                        </button>
                    </div>
                </div>
            </header>

            <section className="relative max-w-screen-2xl px-8 pt-13 mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(238,29,82,0.1)] border border-[rgba(238,29,82,0.25)] text-[11px] font-bold text-[#EE1D52] tracking-[0.08em] uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EE1D52] shadow-[0_0_8px_#EE1D52] inline-block" />
                                Live Gallery
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[11px] font-semibold text-[#00D4FF] tracking-[0.06em]">
                                Updated Feb 21, 2026
                            </span>
                        </div>

                        <h1 className="text-[36px] font-extrabold tracking-[-0.03em] leading-[1.15] text-white m-0">
                            Media Gallery
                            <br />
                            <span className="bg-[linear-gradient(135deg,#EE1D52_0%,#ff6b9d_50%,#EE1D52_100%)] bg-clip-text text-transparent bg-size-[200%]">
                                JKT48
                            </span>{' '}
                            <span className="text-white/35">Official</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        {[
                            { label: 'Photos', value: '1,240+', color: '#EE1D52', shadow: 'rgba(238,29,82,0.4)' },
                            { label: 'Videos', value: '380+', color: '#00D4FF', shadow: 'rgba(0,212,255,0.4)' },
                            { label: 'Members', value: '48', color: '#a855f7', shadow: 'rgba(168,85,247,0.4)' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <div
                                    className="text-[24px] font-extrabold tracking-[-0.02em]"
                                    style={{
                                        color: stat.color,
                                        textShadow: `0 0 20px ${stat.shadow}`,
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-[11px] font-semibold text-white/35 tracking-[0.06em] uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── STORY CAROUSEL (Terintegrasi Embla) ─── */}
            <div className="relative px-8 z-10 max-w-screen-2xl mx-auto">
                <StoryCarousel
                    activeMember={nickname}
                    onSelectMember={handleMemberSelect}
                />
            </div>

            <div className="mx-8 mb-4 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08)_20%,rgba(255,255,255,0.08)_80%,transparent)]" />

            {/* ─── CONTROL BAR ─── */}
            <div className="relative z-40 max-w-screen-2xl mx-auto">
                <FloatingControlBar
                    viewMode={viewMode}
                    onViewModeChange={(mode) => {
                        setViewMode(mode);
                        handlePageChange(1); // Reset page saat ganti mode
                    }}
                    activePlatform={source}
                    onPlatformChange={handlePlatformChange}
                    searchQuery={searchInput}
                    onSearchChange={setSearchInput}
                />
            </div>

            {/* ─── SECTION LABEL ─── */}
            <div className="px-8 mb-6 max-w-screen-2xl mx-auto flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-white/35 uppercase">
                        {nickname ? `${nickname}'s` : 'All'} Posts
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EE1D52]/10 text-[#EE1D52] border border-[#EE1D52]/25">
                        {paging?.total_item || 0} results
                    </span>
                </div>
            </div>

            {/* ─── GALLERY GRID ─── */}
            <main className="relative z-10 max-w-screen-2xl mx-auto min-h-[40vh]">
                {imgQuery.isFetching ? (
                    <div className="py-20 flex justify-center items-center flex-col gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[#EE1D52] border-t-transparent animate-spin"></div>
                        <p className="text-white/50 text-sm animate-pulse">Memuat foto...</p>
                    </div>
                ) : (
                    <GalleryGrid
                        viewMode={viewMode}
                        items={mappedPhotos} // Lempar data yang sudah di-mapping
                        onItemClick={setLightboxItem}
                    />
                )}
            </main>

            {/* ─── PAGINATION ─── */}
            <div className="relative z-10 max-w-screen-2xl mx-auto">
                <Pagination
                    currentPage={page}
                    totalPages={maxPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* ─── LIGHTBOX ─── */}
            {lightboxItem && (
                <Lightbox
                    item={lightboxItem}
                    allItems={mappedPhotos}
                    onClose={() => setLightboxItem(null)}
                    onNavigate={setLightboxItem}
                />
            )}

            <footer className="px-8 py-8 border-t border-white/6 bg-white/1.5">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-linear-to-br from-[#EE1D52] to-[#c01240]">
                            <Sparkles size={12} color="white" />
                        </div>
                        <span className="text-[13px] font-bold text-white/50 tracking-[0.01em]">
                            JKT48 Media Gallery © 2026
                        </span>
                    </div>
                    <span className="text-[12px] text-white/20 font-medium">
                        Fan-made project. Not affiliated with JKT48 official management.
                    </span>
                </div>
            </footer>

        </div>
    );
}