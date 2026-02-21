import { GalleryCard } from './GalleryCard';

export function GalleryGrid({ viewMode, items, onItemClick }) {
    if (!items || items.length === 0) {
        return (
            <div className="w-full py-20 flex justify-center items-center flex-col gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgba(255,255,255,0.2)" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216v96.69l-36.69-36.69a16,16,0,0,0-22.62,0L96,176.69,67.31,148a16,16,0,0,0-22.62,0L40,152.69Z"></path></svg>
                <p className="text-white/40 text-sm font-medium">Tidak ada media yang ditemukan.</p>
            </div>
        );
    }

    // Tampilan: Mode Grid (Kotak Rapat)
    if (viewMode === 'grid') {
        return (
            <div className="px-8 pb-8">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="group relative aspect-square overflow-hidden bg-[#111120] border-none p-0 cursor-pointer block"
                        >
                            {item.isVideo ? (
                                <video src={item.image} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={item.image} alt={item.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-t from-black/90 to-transparent">
                                <p className="text-[11px] font-medium text-white line-clamp-2 text-left">{item.caption}</p>
                            </div>

                            {item.isVideo && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#EE1D52]/85 text-[8px] font-bold text-white tracking-[0.05em]">
                                    ▶ VIDEO
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Tampilan: Mode Album
    return (
        <div className="px-8 pb-8">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {items.map((item, idx) => (
                    <GalleryCard key={item.id} item={item} onClick={onItemClick} index={idx} />
                ))}
            </div>
        </div>
    );
}