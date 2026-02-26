const platformColors = {
    Instagram: '#E1306C',
    TikTok: '#EE1D52',
    X: '#1DA1F2',
}

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
}

export function GalleryCard({ item, onClick, index }) {
    const heightMap = {
        portrait: 340,
        landscape: 220,
        square: 280,
    }
    const imageHeight = heightMap[item.aspectRatio] || 280
    const platformColor = platformColors[item.platform] || '#EE1D52'

    return (
        <div className="relative break-inside-avoid group cursor-pointer px-2 pt-2 pb-0"
            style={{ animationDelay: `${index * 0.05}s` }} onClick={() => onClick(item)}>
            {/* Stacked polaroid layers */}
            {/* Stacked polaroid layers */}
            <div className="absolute inset-1 rounded-2xl rotate-[5deg] z-0 bg-linear-to-br from-[#1e1e38] to-[#141428] border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0.5 rounded-2xl rotate-[2.5deg] z-1 bg-linear-to-br from-[#1a1a32] to-[#10102a] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.4)]" />

            {/* Main card */}
            <div className="relative rounded-2xl overflow-hidden z-2 bg-[#111120] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

                {/* Image Area */}
                <div className="relative overflow-hidden" style={{ height: imageHeight }}>
                    {item.isVideo ? (
                        <video
                            src={item.image}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            muted
                            playsInline
                        />
                    ) : (
                        <img
                            src={item.image}
                            alt={item.caption}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,7,15,0.92)_0%,rgba(7,7,15,0.4)_50%,rgba(7,7,15,0.05)_100%)]" />

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

                    <div
                        className="flex items-center justify-center rounded-full backdrop-blur-md w-6.5 h-6.5"
                        style={{
                            background: `${platformColor}22`,
                            border: `1px solid ${platformColor}55`,
                            color: platformColor,
                        }}>
                        {platformIcons[item.platform]}
                    </div>
                </div>
            </div>
        </div>
    )
}