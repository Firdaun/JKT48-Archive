import { Search, X, BookOpen, LayoutGrid } from 'lucide-react';
import { useRef } from 'react';
import { platforms } from '../data/platforms';

export function FloatingControlBar({
    onClear,
    viewMode,
    onViewModeChange,
    activePlatform,
    onPlatformChange,
    searchQuery,
    onSearchChange,
}) {
    const inputRef = useRef(null);

    return (
        <div className="sticky top-4 z-40 px-8 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between gap-6 flex-wrap">

                    {/* ── Segmented View Toggle ── */}
                    <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10">
                        <button
                            onClick={() => onViewModeChange('album')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-[13px] font-semibold tracking-[0.01em] ${viewMode === 'album'
                                    ? 'bg-linear-to-br from-[#EE1D52] to-[#c01240] text-white shadow-[0_4px_16px_rgba(238,29,82,0.4)]'
                                    : 'bg-transparent text-white/45'
                                }`}>
                            <BookOpen size={14} />
                            Album View
                        </button>
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-[13px] font-semibold tracking-[0.01em] ${viewMode === 'grid'
                                    ? 'bg-linear-to-br from-[#00D4FF] to-[#0099bb] text-white shadow-[0_4px_16px_rgba(0,212,255,0.35)]'
                                    : 'bg-transparent text-white/45'
                                }`}>
                            <LayoutGrid size={14} />
                            Grid View
                        </button>
                    </div>

                    {/* ── Social Platform Filter ── */}
                    <div className="relative flex items-center gap-1">
                        {platforms.map((platform) => {
                            const isActive = activePlatform === platform.key;
                            return (
                                <button
                                    key={platform.key}
                                    onClick={() => onPlatformChange(platform.key)}
                                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all duration-200 text-xs tracking-[0.02em] ${isActive ? 'text-white font-bold bg-[#EE1D52]/10' : 'text-white/40 font-medium bg-transparent'
                                        }`}>
                                    <span className={isActive ? 'text-[#EE1D52]' : 'text-white/40'}>
                                        {platform.icon}
                                    </span>
                                    <span>{platform.label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-[#EE1D52] to-[#ff6b9d] shadow-[0_0_8px_#EE1D52]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Search Bar ── */}
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full flex-1 min-w-50 max-w-70 bg-white/5 border border-white/10 transition-colors duration-200 focus-within:border-[#EE1D52]/50 focus-within:shadow-[0_0_0_3px_rgba(238,29,82,0.12)]">
                        <Search size={14} className="text-white/35 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search captions, members…"
                            value={searchQuery}
                            onChange={e => onSearchChange(e.target.value)}
                            className="bg-transparent outline-none flex-1 min-w-0 text-white text-[13px] font-normal"
                        />
                        {searchQuery && (
                            <button
                                onClick={onClear}
                                className="flex items-center justify-center rounded-full transition-all duration-150 w-4.5 h-4.5 bg-white/10 shrink-0"
                            >
                                <X size={10} className="text-white/70" />
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}