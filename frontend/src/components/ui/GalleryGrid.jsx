import { GalleryCard } from './GalleryCard'

export function GalleryGrid({ viewMode, items, onItemClick}) {
    if (!items || items.length === 0) {
        return (
            <div className="w-full py-20 flex justify-center items-center flex-col gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(255,255,255,0.2)" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216v96.69l-36.69-36.69a16,16,0,0,0-22.62,0L96,176.69,67.31,148a16,16,0,0,0-22.62,0L40,152.69Z"></path></svg>
                <p className="text-white/40 text-sm font-medium">Tidak ada media yang ditemukan.</p>
            </div>
        )
    }
    // Tampilan: Mode Grid (Kotak Rapat)
    if (viewMode === 'grid') {
        const emptySlotsCount = Math.max(0, 28 - items.length)
        return (
            <div className="px-8 pb-8">
                <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                    {items.map((item, index) => (
                        <button key={item.id} onClick={() => onItemClick(item)} style={{ animationDelay: `${index * 0.04}s` }} className="relative rounded-xl overflow-hidden group animate-fade-in-up aspect-square border border-white/[0.07] cursor-pointer">
                            {item.isVideo ? (
                                <video
                                    src={item.image}
                                    alt={item.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={item.image}
                                    alt={item.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                            )}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 bg-[linear-gradient(to_top,rgba(7,7,15,0.95)_0%,rgba(7,7,15,0.2)_60%,transparent_100%)]">
                                <p className="text-[11px] font-medium text-white text-left leading-[1.4] line-clamp-2">
                                    {item.caption}
                                </p>
                            </div>
                            {item.isVideo && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[rgba(238,29,82,0.85)] text-[8px] font-bold text-white tracking-[0.05em]">
                                    ▶ VIDEO
                                </div>
                            )}
                        </button>
                    ))}
                    {[...Array(emptySlotsCount)].map((_, index) => (
                        <div 
                            key={`empty-grid-${index}`} 
                            className="aspect-square pointer-events-none"
                        ></div>
                    ))}
                </div>
            </div>
        )
    }

    const emptyAlbumSlotsCount = Math.max(0, 8 - items.length)
    return (
        <div className="px-8 pb-8">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((item, idx) => (
                    <GalleryCard key={item.id} item={item} onClick={onItemClick} index={idx} />
                ))}
                {[...Array(emptyAlbumSlotsCount)].map((_, index) => (
                    <div 
                        key={`empty-album-${index}`} 
                        className="pointer-events-none w-full"
                        style={{ minHeight: '402.469px' }}
                    ></div>
                ))}
            </div>
        </div>
    )
}