import { platformIcons } from "../data/platforms"

const platformColors = {
    Instagram: '#E1306C',
    TikTok: '#EE1D52',
    X: '#1DA1F2',
}

export function GalleryCard({ item, onClick, index }) {
    const heightMap = {
        portrait: 340,
        landscape: 220,
        square: 280,
    }
    const platformColor = platformColors[item.platform] || '#EE1D52'

    return (
        <div className="relative break-inside-avoid group cursor-pointer px-2 pt-2 pb-0"
            style={{ animationDelay: `${index * 0.05}s` }} onClick={() => onClick(item)}>
            <div className="absolute inset-1 rounded-xl md:rounded-2xl rotate-[5deg] z-0 bg-linear-to-br from-[#1e1e38] to-[#141428] border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-0.5 rounded-xl md:rounded-2xl rotate-[1.2deg] z-1 bg-linear-to-br from-[#1a1a32] to-[#10102a] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.4)]" />
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden z-2 bg-[#111120] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

                <div className="relative overflow-hidden h-50 xs:h-70 xl:h-85">
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

                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4">
                        <span className="block mb-1 text-[8px] md:text-[9px] font-semibold text-white/50 tracking-[0.08em] uppercase">
                            {item.date}
                        </span>
                        <p className="text-[10px] md:text-[11px] font-medium text-white leading-relaxed line-clamp-2">
                            {item.caption}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-t border-white/5">
                    <span className="text-[8px] md:text-[11px] font-bold text-white/50 tracking-[0.04em]">
                        @{item.member.toLowerCase()}
                    </span>

                    <div
                        className="flex items-center justify-center rounded-full backdrop-blur-md w-5 h-5 md:w-6.5  md:h-6.5"
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