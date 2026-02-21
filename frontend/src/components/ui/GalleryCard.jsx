import React from 'react';
import { Play, Heart, MessageCircle } from 'lucide-react';

const platformColors = {
    Instagram: '#E1306C',
    TikTok: '#EE1D52',
    X: '#1DA1F2',
};

const platformIcons = {
    Instagram: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
        </svg>
    ),
    TikTok: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z" />
        </svg>
    ),
    X: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
};

function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
}

export function GalleryCard({ item, onClick, index }) {
    const heightMap = {
        portrait: 340,
        landscape: 220,
        square: 280,
    };
    const imageHeight = heightMap[item.aspectRatio] || 280;
    const platformColor = platformColors[item.platform] || '#EE1D52';

    return (
        <div
            className="relative mb-6 break-inside-avoid gallery-card cursor-pointer px-2 pt-2 pb-0"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => onClick(item)}
        >
            {/* Stacked polaroid layers */}
            <div className="card-stacked-layer-2" />
            <div className="card-stacked-layer-1" />

            {/* Main card */}
            <div className="relative rounded-2xl overflow-hidden z-2 bg-[#111120] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

                {/* Image Area */}
                <div className="relative overflow-hidden" style={{ height: imageHeight }}>
                    <img
                        src={item.image}
                        alt={item.caption}
                        className="w-full h-full object-cover card-image"
                        loading="lazy"
                    />

                    {/* Gradient overlay untuk teks */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,7,15,0.92)_0%,rgba(7,7,15,0.4)_50%,rgba(7,7,15,0.05)_100%)]" />

                    {/* Video play button */}
                    {item.isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="play-btn-glass flex items-center justify-center rounded-full w-14 h-14">
                                <Play
                                    size={22}
                                    className="text-white ml-0.75 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                                    fill="white"
                                />
                            </div>
                            {/* Video badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#EE1D52]/85 backdrop-blur-md text-[9px] font-bold text-white tracking-[0.06em]">
                                <span>▶</span> VIDEO
                            </div>
                        </div>
                    )}

                    {/* Platform badge */}
                    <div
                        className="absolute top-3 right-3 flex items-center justify-center rounded-full backdrop-blur-md"
                        style={{
                            width: 26,
                            height: 26,
                            background: `${platformColor}22`,
                            border: `1px solid ${platformColor}55`,
                            color: platformColor,
                        }}
                    >
                        {platformIcons[item.platform]}
                    </div>

                    {/* Bottom text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        {/* Date */}
                        <span className="block mb-1 text-[10px] font-semibold text-white/50 tracking-[0.08em] uppercase">
                            {item.date}
                        </span>
                        {/* Caption */}
                        <p className="text-[13px] font-medium text-white leading-relaxed line-clamp-2">
                            {item.caption}
                        </p>
                    </div>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                    {/* Member */}
                    <span className="text-[11px] font-bold text-white/50 tracking-[0.04em]">
                        @{item.member.toLowerCase()}
                    </span>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-white/40">
                            <Heart size={11} className="text-[#EE1D52]" />
                            {formatCount(item.likes)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white/40">
                            <MessageCircle size={11} className="text-[#00D4FF]" />
                            {formatCount(item.comments)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}